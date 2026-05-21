import firebase_admin
from firebase_admin import credentials, firestore
import json
import logging
import os
from pathlib import Path
from google.api_core import exceptions
import hashlib
from process_data import ProfessorModel, processar_professor
import argparse

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

def setup_firestore():
    # Você deve baixar o arquivo JSON de conta de serviço no console do Firebase
    # Configurações do Projeto > Contas de Serviço > Gerar nova chave privada
    base_path = Path(__file__).parent
    
    # Recomendado: Definir o caminho em uma variável de ambiente para segurança
    cred_path_env = os.environ.get('FIREBASE_SERVICE_ACCOUNT_JSON') #
    
    if cred_path_env: #
        cred_path = Path(cred_path_env) #
        if not cred_path.exists(): #
            logger.error(f"Arquivo de credenciais especificado em FIREBASE_SERVICE_ACCOUNT_JSON não encontrado: {cred_path}") #
            logger.info("Dica: Verifique o caminho ou a variável de ambiente. Nunca envie o arquivo .json para o GitHub.") #
            return None #
    else: #
        cred_path = base_path / 'serviceAccountKey.json' #
        if not cred_path.exists(): #
            logger.error(f"Arquivo de credenciais padrão não encontrado em: {cred_path}") #
            logger.info("Dica: Crie 'serviceAccountKey.json' ou use a variável FIREBASE_SERVICE_ACCOUNT_JSON.") #
            return None #
    
    cred = credentials.Certificate(str(cred_path))
    try: #
        firebase_admin.initialize_app(cred) #
    except ValueError: #
        pass #
    return firestore.client()

def migrate(input_path=None):
    db = setup_firestore()
    if not db: return

    base_path = Path(__file__).parent
    input_file = Path(input_path) if input_path else base_path / 'backup_professores_2026-05-18.json'

    try: #
        with open(input_file, 'r', encoding='utf-8') as f: #
            dados = json.load(f) #
    except FileNotFoundError: #
        logger.error(f"Arquivo de entrada não encontrado: {input_file}") #
        return #
    except json.JSONDecodeError as e: #
        logger.error(f"Erro ao decodificar o arquivo JSON '{input_file}': {e}") #
        return #

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
                # Criar um ID determinístico baseado no nome e escola para evitar colisões
                unique_string = f"{processed['nome']}_{processed.get('escola', '')}"
                doc_id = hashlib.md5(unique_string.encode()).hexdigest()
                
                doc_ref = db.collection('professores').document(doc_id)
                
                batch.set(doc_ref, processed)
                count += 1
                
                # Firestore permite lotes (batches) de no máximo 500 operações
                if count % 500 == 0:
                    batch.commit()
                    logger.info(f"Commitando lote de 500 professores. Total processado: {count}") #
                    batch = db.batch()

        if count > 0:
            batch.commit()
            logger.info(f"{count} professores migrados com sucesso.")
        else:
            logger.warning("Nenhum professor foi processado para migração.")

        # 2. Migrar Metadados (Escolas e Disciplinas)
        config_ref = db.collection('configuracoes').document('geral')
        config_ref.set({
            'escolas': dados.get('escolas', []),
            'disciplinas': dados.get('disciplinas', []),
            'ultima_atualizacao': firestore.SERVER_TIMESTAMP
        }, merge=True)
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
    parser = argparse.ArgumentParser(description="Migra dados de professores para o Firestore.")
    parser.add_argument('--input', type=str, help="Caminho do arquivo JSON de entrada.")
    args = parser.parse_args()
    migrate(args.input)