#!/usr/bin/env bash
# Verificação de publicação da Base de Conhecimento (ver PUBLICACAO.md).
# Confere o índice do Git (o que vai para o próximo commit). Uso: rodar antes de cada commit
# ou instalar como gancho: ln -sf ../../base-conhecimento/verificar-publicacao.sh .git/hooks/pre-commit
set -u
export LC_ALL=C.UTF-8
cd "$(git rev-parse --show-toplevel)" || exit 2
D=base-conhecimento
falhas=0
falha() { echo "BLOQUEADO: $*" >&2; falhas=$((falhas + 1)); }

# 1. Caminhos internos ou restritos não podem estar no índice (em qualquer pasta).
while IFS= read -r p; do
  falha "arquivo interno/restrito no índice: $p"
done < <(git ls-files | grep -i -E '(CONTROLE_INTERNO_NAO_PUBLICAR/|de[_-]?para|Acervo_Atividade_|Base_Mestra_Daily|(^|/)03_Acervos_Ian/|(^|/)02_Base_Mestra/)')

# 2. Conteúdo: marcadores do de-para e nomes protegidos (padrão em base64 de propósito; não decodificar em arquivos).
privado="$(printf '%s' 'XGIoPzppdGFbdcO6XXxFQUN8cGVyc29ubmFsaXRcdyp8bGFzdHJvKVxi' | base64 -d)"
while IFS= read -r p; do
  conteudo="$(git show ":$p" 2>/dev/null)" || continue
  if printf '%s' "$conteudo" | grep -q -i -E 'Classifica(ç|c)(ã|a)o:\*\* controle interno|Registro de correspond(ê|e)ncias|SRC-[0-9]{3}|MAT-[0-9]{3}'; then
    falha "marcador de controle interno (de-para) em: $p"
  fi
  if printf '%s' "$conteudo" | grep -q -E '^\*\*Original:\*\*|Tradu(ç|c)(ã|a)o enviada:|^# ACERVO DE APRENDIZADO'; then
    falha "texto de acervo de atividade (material do curso) em: $p"
  fi
  if printf '%s' "$conteudo" | grep -q -i -P "$privado"; then
    falha "nome protegido em: $p"
  fi
done < <(git ls-files -- "$D")

# 3. Integridade: cada arquivo publicado do pacote deve ser idêntico ao original (MANIFESTO_SHA256.txt).
while read -r soma caminho; do
  [ -z "$caminho" ] && continue
  if git ls-files --error-unmatch -- "$D/$caminho" >/dev/null 2>&1; then
    atual="$(git show ":$D/$caminho" | sha256sum | cut -d' ' -f1)"
    [ "$atual" = "$soma" ] || falha "diverge do original: $D/$caminho"
  fi
done < "$D/MANIFESTO_SHA256.txt"

if [ "$falhas" -gt 0 ]; then
  echo "$falhas problema(s). Nada deve ser commitado até resolver (ver $D/PUBLICACAO.md)." >&2
  exit 1
fi
echo "verificar-publicacao: OK ($(git ls-files -- "$D" | wc -l) arquivos da Base no índice)"
