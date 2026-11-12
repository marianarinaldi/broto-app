# Broto

Aplicativo mobile para organizar os cuidados com plantas. O usuário cadastra
suas plantas, define a frequência de rega, agenda lembretes, registra os
cuidados e consulta um catálogo com recomendações de luz, ambiente, rega e
adubação.

## Funcionalidades

- Cadastro, edição e exclusão de plantas.
- Um único campo de nome/espécie, com seleção no catálogo ou cadastro manual.
- Seleção de espécie pelo catálogo ou cadastro de espécie personalizada.
- Preenchimento automático de frequência de rega, luz e ambiente.
- Registro de rega com atualização imediata do próximo cuidado.
- Foto da planta pela câmera ou galeria.
- Lembretes locais de cuidados.
- Guia de cuidados com pesquisa, filtros e fallback local.
- CRUD de espécies personalizadas no catálogo remoto.
- Estados de carregamento, erro, vazio, sucesso e confirmação de exclusão.
- Interface acessível com labels, hints, feedback para leitor de tela e alvos
  de toque confortáveis.

## Tecnologias

- React Native com Expo SDK 58.
- React Navigation: Native Stack + Bottom Tabs.
- Context API para estado global.
- Firebase Firestore para persistência NoSQL.
- Expo Image Picker, Notifications, Haptics e DateTimePicker.
- `@expo/vector-icons`.
- Jest e React Native Testing Library.

## Estrutura do projeto

```text
src/
├── assets/       # Ícones e imagens do aplicativo
├── components/   # Componentes visuais reutilizáveis
├── config/       # Configuração do Firebase
├── constants/    # Catálogo local e valores fixos
├── context/      # Estado global das plantas
├── navigation/   # Stack e Bottom Tabs
├── screens/      # Telas do aplicativo
├── services/     # Firestore, catálogo e notificações
├── utils/        # Regras e funções de domínio
└── __tests__/    # Testes unitários
```

## Pré-requisitos

- Node.js LTS.
- npm.
- Android Studio com Android SDK e um emulador configurado, ou um aparelho
  Android com depuração USB.
- Java/JDK 17 para gerar uma Development Build Android.

## Instalação e execução

```bash
git clone https://github.com/marianarinaldi/broto-app.git
cd broto-app
npm install
npx expo start
```

Para usar o Expo Go:

```bash
npx expo start --go
```

Para usar a Development Build, necessária para validar os módulos nativos:

```bash
npx expo run:android
npx expo start --dev-client
```

Antes de executar no Android, confirme:

```bash
adb devices
java -version
```

O dispositivo deve aparecer como `device`, e não `offline`.

## Firebase e Firestore

O projeto usa o Firebase Web SDK. A configuração de teste está em
[`src/config/firebaseConfig.js`](./src/config/firebaseConfig.js). Para outro
projeto Firebase, substitua os valores da configuração pelo aplicativo Web
correspondente e habilite o Firestore.

As regras versionadas estão em [`firestore.rules`](./firestore.rules). Para
aplicá-las usando a Firebase CLI:

```bash
firebase login
firebase use SEU_PROJECT_ID
firebase deploy --only firestore:rules
```

O app usa as coleções:

- `plants`: plantas cadastradas e seus cuidados;
- `plant_catalog`: catálogo remoto de espécies.

### Atualização do próximo cuidado

Ao registrar uma rega, o serviço grava no mesmo documento:

- `lastWateredDate`;
- `nextCareDate`;
- `nextCare`.

`nextCareDate` é calculado somando `wateringFrequency` à data atual. O
`PlantsContext` mescla os três valores no estado global e a tela de detalhes
consome a planta atualizada, sem depender de reiniciar ou trocar de aba.

### Catálogo resiliente

[`src/constants/plantCatalogData.js`](./src/constants/plantCatalogData.js) é a
fonte local versionada. [`src/services/catalogService.js`](./src/services/catalogService.js)
consulta `plant_catalog`, inicia o seed quando a coleção está vazia e usa o
catálogo local quando o Firestore está indisponível. A tela do guia possui o
botão **Restaurar catálogo padrão**.

### CRUD de espécies

A tela **Cadastrar espécie** permite criar uma recomendação personalizada com
nome, nome científico, categoria, ambiente, luz, intervalo de rega e dicas.
Esses registros são gravados na coleção `plant_catalog` com `source: "user"`.

O fluxo completo é:

- **Create:** botão “Cadastrar nova espécie” no guia;
- **Read:** espécies remotas aparecem no guia e no seletor do cadastro;
- **Update:** espécies criadas pelo usuário possuem “Editar espécie”;
- **Delete:** espécies criadas pelo usuário possuem “Excluir”.

Os registros oficiais do seed não exibem ações de edição/exclusão, evitando que
uma alteração acidental remova o catálogo padrão. A opção de restauração
reaplica os dados oficiais usando `merge`.

> As regras atuais são adequadas apenas para a demonstração acadêmica sem
> autenticação. Elas permitem acesso ao projeto de teste. Antes de publicar na
> Google Play, implemente Firebase Auth, salve `userId` nas plantas e restrinja
> as regras ao usuário autenticado.

## Testes e validação

```bash
npm test -- --runInBand
npx expo export --platform android
npx expo install --check
```

O teste atual cobre a renderização das recomendações e dos ícones do
[`PlantCareCard`](./src/__tests__/PlantCareCard.test.js).

Os testes também validam o cálculo da próxima rega e a classificação dos
status `Regar hoje`, `Atrasada` e próximos cuidados em
[`plantService.test.js`](./src/__tests__/plantService.test.js).

## Design e fluxo principal

O fluxo principal foi desenhado para reduzir toques:

1. A tela **Hoje** prioriza plantas atrasadas ou que precisam de água.
2. O botão **Regar** aparece diretamente nos cards da home e de **Minhas
   plantas**.
3. Após a rega, a próxima data é recalculada e o status visual do card muda.
4. O cadastro possui um único seletor de nome/espécie, com opção para
   cadastrar uma espécie fora do catálogo.
5. A tela de detalhes destaca próxima rega, última rega e recomendações da
   espécie.

Os valores visuais compartilhados ficam em
[`src/constants/theme.js`](./src/constants/theme.js), e regras de data/status
ficam em [`src/utils/watering.js`](./src/utils/watering.js).

## Fluxo demonstrado

1. Abrir a tela inicial.
2. Adicionar uma planta.
3. Selecionar uma espécie no catálogo.
4. Conferir o preenchimento automático dos cuidados.
5. Escolher uma foto e uma data.
6. Salvar e verificar a planta no Firestore.
7. Abrir os detalhes e registrar uma rega.
8. Confirmar que o próximo cuidado foi recalculado imediatamente.
9. Editar e excluir a planta com confirmação.
10. Abrir o guia, pesquisar uma espécie e restaurar o catálogo.

## Organização Git Flow

O projeto utiliza:

- `main`: versão estável;
- `develop`: integração das funcionalidades;
- `feature/nome-da-funcionalidade`: desenvolvimento isolado.

As funcionalidades devem ser entregues por Pull Requests para `develop`, com
revisão antes do merge. Exemplos de branches utilizadas:

- `feature/navigation-and-structure`;
- `feature/plants-crud`;
- `feature/plant-form`;
- `feature/global-plant-state`;
- `feature/native-plant-features`;
- `feature/ux-feedback`;
- `feature/plant-care-guide`.

## Equipe e divisão de tarefas

Preencha esta seção com os nomes oficiais da equipe antes da entrega:

| Integrante | Responsabilidades         |
| ---------- | ------------------------- |
| Mariana    | Navegação e estrutura     |
| Mariana    | Firebase e CRUD           |
| Mariana    | Formulários e UX          |
| Mariana    | Recursos nativos e testes |

## Screenshots e vídeo

Adicione nesta seção as capturas reais do aplicativo e o link do vídeo de
3–5 minutos exigido pelo professor:

```text
- Screenshot da tela inicial: adicionar caminho ou imagem aqui
- Screenshot do cadastro: adicionar caminho ou imagem aqui
- Screenshot do guia: adicionar caminho ou imagem aqui
- Vídeo de demonstração: adicionar link aqui
```

Para a entrega, substitua os marcadores acima por imagens reais armazenadas em
`docs/screenshots/` e pelo link do vídeo de 3–5 minutos.
