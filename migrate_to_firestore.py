import firebase_admin
from firebase_admin import credentials, firestore
import json
import logging
import os
from pathlib import Path
from google.api_core import exceptions
import hashlib
from process_data import ProfessorModel, processar_professor

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def setup_firestore():
    # Você deve baixar o arquivo JSON de conta de serviço no console do Firebase
    # Configurações do Projeto > Contas de Serviço > Gerar nova chave privada
    base_path = Path(__file__).parent
    
    # Recomendado: Definir o caminho em uma variável de ambiente para segurança
    cred_path_env = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON')
    cred_path = Path(cred_path_env) if cred_path_env else base_path / 'serviceAccountKey.json'

    if not cred_path.exists():
        logger.error(f"Arquivo de credenciais não encontrado em: {cred_path}")
        logger.info("Dica: Defina a variável FIREBASE_SERVICE_ACCOUNT_JSON com o caminho do seu arquivo .json.")
        return None
    
    cred = credentials.Certificate(str(cred_path))
    firebase_admin.initialize_app(cred)
    return firestore.client()

def migrate():
    db = setup_firestore()
    if not db: return

    base_path = Path(__file__).parent
    input_file = base_path / 'backup_professores_2026-05-18.json'
    
    with open(input_file, 'r', encoding='utf-8') as f:
        dados = json.load(f)

    professores = dados['professores']
    logger.info(f"Iniciando upload de {len(professores)} professores para o Firestore...")

    if not professores:
        logger.warning("Nenhum professor encontrado no arquivo de entrada. Nenhuma migração de professores será realizada.")
        # Ainda prossegue para migrar metadados, se houver
        pass

    try:
        # 1. Migrar Professores
        batch = db.batch()
        count = 0
        for prof_data in professores:
            # Reutilizamos sua lógica de processamento e validação
            processed = processar_professor(prof_data)
            if processed:
                # Criar um ID determinístico baseado no nome para evitar duplicatas
                doc_id = hashlib.md5(processed['nome'].encode()).hexdigest()
                doc_ref = db.collection('professores').document(doc_id)
                
                batch.set(doc_ref, processed)
                count += 1
                
                # Firestore permite lotes (batches) de no máximo 500 operações
                if count % 500 == 0:
                    batch.commit()
                    batch = db.batch()

        if count > 0:
            batch.commit()
            logger.info(f"{count} professores migrados com sucesso.")
        else:
            logger.warning("Nenhum professor foi processado para migração.")

        # 2. Migrar Metadados (Escolas e Disciplinas)
        db.collection('configuracoes').document('geral').set({
            'escolas': dados.get('escolas', []),
            'disciplinas': dados.get('disciplinas', []),
            'ultima_atualizacao': firestore.SERVER_TIMESTAMP
        })
        logger.info("Metadados migrados.")

    except exceptions.NotFound:
        logger.error(
            "Erro: O banco de dados Firestore não foi inicializado no projeto 'edmprofessor-1542b'.\n"
            "Por favor, acesse https://console.firebase.google.com/project/edmprofessor-1542b/firestore "
            "e clique em 'Criar banco de dados'."
        )
    except Exception as e:
        logger.error(f"Ocorreu um erro durante a migração: {e}")

if __name__ == "__main__":
    migrate()