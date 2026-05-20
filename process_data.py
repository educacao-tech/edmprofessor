import json
import multiprocessing
import time
import logging
from pathlib import Path
import argparse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field, ValidationError

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# --- Pydantic Models para Validação de Dados ---
class ProfessorModel(BaseModel):
    nome: str
    escola: str
    disciplina: str
    ano: str
    turma: str
    turno: str
    telefone: str = Field(pattern=r"^\(\d{2}\) \d{5}-\d{4}$", description="Formato: (XX) XXXXX-XXXX")

    # Pydantic v2: Permite campos dinâmicos (como as chaves de presença)
    model_config = {
        "extra": "allow"
    }

# Função que simula uma tarefa pesada de CPU
def processar_professor(professor_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    try:
        professor = ProfessorModel(**professor_data)
        
        # Simulação de carga de trabalho
        nome_processado = professor.nome.upper()
        time.sleep(0.05) 
        
        # Converte o modelo Pydantic de volta para um dicionário para modificação
        processed_professor_data = professor.model_dump() if hasattr(professor, 'model_dump') else professor.dict()
        processed_professor_data['nome_processado'] = nome_processado

        for key, value in processed_professor_data.items():
            if key.startswith('presenca_') and isinstance(value, bool):
                # Aqui você poderia implementar regras de negócio para a presença
                pass 

        return processed_professor_data
    except ValidationError as e:
        logging.error(f"Erro de validação para professor '{professor_data.get('nome', 'Nome Desconhecido')}': {e}")
        return None # Retorna None para professores com dados inválidos
    except Exception as e:
        logging.error(f"Erro inesperado ao processar professor '{professor_data.get('nome', 'Nome Desconhecido')}': {e}")
        return None

def main():
    # --- Configuração de Argumentos de Linha de Comando ---
    parser = argparse.ArgumentParser(description="Processa dados de professores em paralelo.")
    parser.add_argument(
        '--input_file', 
        type=str, 
        default=r'c:\Users\server\OneDrive\Documentos\GitHub\edmprofessor\backup_professores_2026-05-18.json',
        help="Caminho para o arquivo JSON de entrada com os dados dos professores."
    )
    args = parser.parse_args()
    caminho_arquivo = Path(args.input_file)
    
    if not caminho_arquivo.exists():
        logging.error(f"Arquivo de entrada não encontrado: {caminho_arquivo}")
        return

    try:
        with open(caminho_arquivo, 'r', encoding='utf-8') as f:
            dados = json.load(f)
    except json.JSONDecodeError as e:
        logging.error(f"Erro ao ler JSON: {e}")
        return
    
    professores = dados['professores']
    logging.info(f"Iniciando processamento de {len(professores)} registros...")
    
    inicio = time.time()
    with multiprocessing.Pool() as pool:
        resultados_brutos = pool.map(processar_professor, professores)
        resultados = [res for res in resultados_brutos if res is not None]
    
    fim = time.time()
    logging.info(f"Tempo com Multiprocessing: {fim - inicio:.2f} segundos")
    logging.info(f"{len(resultados_brutos) - len(resultados)} professores falharam no processamento/validação.")

    # Salvar os dados processados para o frontend
    output_data = {
        "professores": resultados,
        "escolas": dados.get("escolas", []),
        "disciplinas": dados.get("disciplinas", [])
    }
    
    # Gera um nome de arquivo de saída com timestamp para evitar sobrescrever
    timestamp = time.strftime("%Y%m%d-%H%M%S")
    caminho_output = caminho_arquivo.parent / f'professores_processados_{timestamp}.json'
    with open(caminho_output, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    logging.info(f"Dados salvos em: {caminho_output}")

if __name__ == "__main__":
    main()