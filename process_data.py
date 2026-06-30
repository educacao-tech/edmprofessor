import json
import multiprocessing
import time
import logging
from pathlib import Path
import argparse
from typing import List, Dict, Any, Optional, Literal
from pydantic import BaseModel, Field, ValidationError, field_validator, model_validator

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# --- Modelos Pydantic para Validação de Dados ---
class ProfessorModel(BaseModel):
    nome: str = Field(..., min_length=3)
    escola: str = Field(..., min_length=2)
    disciplina: str = Field(..., min_length=2)
    ano: str 
    turma: str
    turno: Literal["MANHÃ", "TARDE", "INTEGRAL", "NOITE", "N/A"]
    telefone: Optional[str] = Field(default=None, pattern=r"^\(\d{2}\) \d{5}-\d{4}$") # Telefone pode ser None, e o padrão só se aplica se não for None
    link_chamada: Optional[str] = None

    @field_validator('nome', 'escola', 'disciplina', 'ano', 'turma', 'turno', mode='before')
    @classmethod
    def normalize_strings(cls, v):
        """Garante que strings sejam limpas e fiquem em maiúsculo para consistência."""
        if isinstance(v, str):
            v = v.strip().upper()
            return v if v != "" else "N/A"
        return v

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
        # Em um ambiente de produção, remova ou comente a linha abaixo
        # time.sleep(0.05)
        
        # Converte o modelo Pydantic de volta para um dicionário para modificação
        # Usar model_dump() é a forma recomendada para Pydantic v2
        processed_professor_data = professor.model_dump()
        processed_professor_data['nome_processado'] = nome_processado

        # Metadados de processamento
        processed_professor_data['_timestamp_processamento'] = time.time()

        return processed_professor_data
    except ValidationError as e:
        logger.error(f"Erro de validação: {professor_data.get('nome')} - {e.errors()[0]['msg']}")
        return None # Retorna None para professores com dados inválidos
    except Exception as e:
        logger.error(f"Erro crítico no registro {professor_data.get('nome')}: {e}")
        return None

def main():
    # --- Configuração de Argumentos de Linha de Comando ---
    parser = argparse.ArgumentParser(description="Processa dados de professores em paralelo.")
    default_path = Path(__file__).parent / 'backup_professores_2026-05-18.json'
    parser.add_argument(
        '--input_file', 
        type=str, 
        default=str(default_path),
        help=f"Caminho para o arquivo JSON de entrada (padrão: {default_path.name})"
    )
    args = parser.parse_args()
    caminho_arquivo = Path(args.input_file)
    
    if not caminho_arquivo.exists():
        logger.error(f"Arquivo não encontrado: {caminho_arquivo}")
        return

    try:
        with open(caminho_arquivo, 'r', encoding='utf-8') as f:
            dados = json.load(f)
    except json.JSONDecodeError as e:
        logger.error(f"O arquivo JSON está corrompido: {e}")
        return
    
    professores = dados['professores']
    logger.info(f"Iniciando processamento de {len(professores)} registros...")
    
    inicio = time.time()
    with multiprocessing.Pool() as pool:
        resultados_brutos = pool.map(processar_professor, professores)
        resultados = [res for res in resultados_brutos if res is not None]
    
    fim = time.time()
    logger.info(f"Processamento concluído em {fim - inicio:.2f}s")
    logger.info(f"Sucesso: {len(resultados)} | Falhas: {len(resultados_brutos) - len(resultados)}")

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
    logger.info(f"Dados salvos em: {caminho_output}")

if __name__ == "__main__":
    main()