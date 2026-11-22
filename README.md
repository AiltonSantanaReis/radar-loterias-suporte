# Radar Loterias — suporte e recuperação

Este repositório público contém o canal de suporte e uma página de recuperação local dos jogos do Mega-Sena Radar. Ele não contém o código completo nem o histórico de desenvolvimento dos aplicativos.

- [Abrir o Radar Loterias](https://radarloterias.com.br/)
- [Abrir o Mega-Sena completo](https://radarloterias.com.br/mega-sena-completo/)
- [Ajuda do portal](https://radarloterias.com.br/ajuda/)
- [Relatar um problema técnico](https://github.com/AiltonSantanaReis/radar-loterias-suporte/issues/new/choose)
- [Recuperar jogos do endereço antigo](https://ailtonsantanareis.github.io/radar-loterias-suporte/recuperar/)

## Preservar jogos do endereço antigo

Se você usava `https://ailtonsantanareis.github.io/mega-sena-radar/`, abra a página de recuperação **no mesmo aparelho, navegador e perfil**. Não limpe os dados do navegador nem desinstale a versão antiga antes de guardar suas cópias.

A página só consulta o armazenamento depois de você pressionar **Procurar meus dados neste navegador**. Ela lê exclusivamente três chaves conhecidas do aplicativo e oferece dois arquivos separados, quando disponíveis:

1. **Jogos e preferências:** JSON no formato `MegaSenaRadarBackup`, versão 2. No novo aplicativo, abra **Meus jogos → Importar jogos do arquivo**.
2. **Bolão:** JSON no formato `MegaSenaRadarPool`, versão 1. No novo aplicativo, abra **Bolão → Importar bolão do arquivo**. Essa importação substitui o plano de bolão que estiver aberto no novo aplicativo.

Os dados não são enviados para servidores, colocados em links ou apagados. O histórico local de resultados não faz parte desses dois formatos de backup. Dados apagados, outro perfil de navegador, navegação privada ou armazenamento separado de um aplicativo instalado podem impedir que a página encontre os jogos. Se a versão antiga instalada ainda abrir, os próprios botões de exportação dela continuam sendo o caminho indicado.

A validação final do arquivo ocorre ao importá-lo no aplicativo. Não envie arquivos de backup, senhas, documentos ou comprovantes em uma issue pública.

## Publicação desta página

O conteúdo estático está em `docs/`. Configure GitHub Pages para publicar a branch `main`, pasta `/docs`. Não há dependências, serviços externos, analytics, funções de servidor ou service worker nesta página de suporte.

O endereço de recuperação precisa permanecer em `https://ailtonsantanareis.github.io`. Uma cópia aberta em outro domínio ou diretamente como arquivo local não consegue ler os dados guardados pelo endereço antigo.

## Verificação de compatibilidade

Os testes usam apenas dados sintéticos e os importadores do aplicativo original, fornecidos localmente. Não publicam nem copiam o código desses importadores para este repositório.

```sh
RADAR_APP_DIR=/caminho/para/mega-sena-radar node --test tests/recovery.test.cjs
```
