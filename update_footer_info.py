import subprocess
import re
from pathlib import Path

def get_git_info():
    try:
        # Obter hash do commit
        hash_cmd = subprocess.run(
            ['git', 'rev-parse', '--short', 'HEAD'],
            capture_output=True, text=True, check=True
        )
        commit_hash = hash_cmd.stdout.strip()

        # Obter data formatada
        date_cmd = subprocess.run(
            ['git', 'log', '-1', '--format=%cd', '--date=format:%d/%m/%Y às %H:%M'],
            capture_output=True, text=True, check=True
        )
        commit_date = date_cmd.stdout.strip()

        # Obter última mensagem de commit
        msg_cmd = subprocess.run(
            ['git', 'log', '-1', '--format=%s'],
            capture_output=True, text=True, check=True
        )
        commit_msg = msg_cmd.stdout.strip()

        return commit_hash, commit_date, commit_msg
    except Exception as e:
        print(f"Erro ao obter informações do Git: {e}")
        return None, None, None

def update_html_footer(file_path, commit_hash, commit_date, commit_msg):
    path = Path(file_path)
    if not path.exists():
        print(f"Arquivo não encontrado: {file_path}")
        return

    content = path.read_text(encoding='utf-8')

    # Expressões regulares para substituir as informações do rodapé
    content = re.sub(
        r'Última Atualização:\s*<strong>.*?</strong>',
        f'Última Atualização: <strong>{commit_date}</strong>',
        content
    )
    content = re.sub(
        r'Commit:\s*<code>.*?</code>',
        f'Commit: <code>{commit_hash}</code>',
        content
    )
    content = re.sub(
        r'Modificação:\s*<em>.*?</em>',
        f'Modificação: <em>{commit_msg}</em>',
        content
    )

    path.write_text(content, encoding='utf-8')
    print(f"Rodapé de {path.name} atualizado com sucesso!")

def main():
    commit_hash, commit_date, commit_msg = get_git_info()
    if not commit_hash:
        return

    print(f"Informações do Git detectadas:")
    print(f"  - Hash: {commit_hash}")
    print(f"  - Data: {commit_date}")
    print(f"  - Mensagem: {commit_msg}")

    root_dir = Path(__file__).parent
    update_html_footer(root_dir / 'index.html', commit_hash, commit_date, commit_msg)
    update_html_footer(root_dir / 'public' / 'index.html', commit_hash, commit_date, commit_msg)

if __name__ == '__main__':
    main()
