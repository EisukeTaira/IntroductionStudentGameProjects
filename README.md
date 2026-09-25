# Student Game Gallery

授業で制作された学生ゲーム作品を紹介する静的Webサイトです。

## ローカル確認

ファイルを直接開くのではなく、プロジェクトのルートでローカルWebサーバーを起動してください。

```powershell
python -m http.server 8000
```

ブラウザで`http://localhost:8000/`を開きます。

## 作品データ

作品情報の原本はGoogleスプレッドシートで管理します。リポジトリ直下の
`データ管理シート.url`を開くと、管理用スプレッドシートへ移動できます。

Webサイトが読み込む公開用データは`data/games.json`です。スプレッドシートを
更新しただけではサイトへ反映されないため、更新後はスプレッドシートから
`games.json`を出力し、リポジトリ内のファイルを置き換えてください。

登録する画像は`assets/images/`へ配置し、JSONへ相対パスを登録します。

## スプレッドシートでの管理方法

「作品」シートで、1作品につき1行を使用します。既存の見出し名や列の順番は
JSON出力に使用されるため、変更しないでください。新しい作品は既存行を上書きせず、
末尾へ追加します。

### 登録から公開まで

1. 新しい行を追加し、`published`をオフにしたまま作品情報を入力します。
2. 画像を`assets/images/`へ配置し、`thumbnail`、`mainImage`、
   `screenshots`へリポジトリルートからの相対パスを入力します。
3. 配布ファイル、起動方法、対応OSを確認します。配布URLがある場合は
   `downloadCheckedAt`へ確認日を入力します。
4. 画像、動画、音楽、ソフトウェアなどの公開権利を確認し、`rightsChecked`を
   オンにします。
5. 必須項目と表示内容を確認してから`published`をオンにします。
6. スプレッドシートから`games.json`を出力し、`data/games.json`を置き換えます。
7. ローカル環境で一覧、詳細、ダウンロードリンク、画像表示を確認してから
   リポジトリへ反映します。

公開を一時停止するときは、行を削除せず`published`をオフにします。

### 主な管理項目

| 項目 | 入力内容 |
| --- | --- |
| `published` | サイトへ掲載する場合にオン |
| `id` | 作品固有ID。半角英小文字・数字・ハイフンのみ（例：`knight-of-ruins`） |
| `title` / `summary` / `description` | 作品名、一覧用の短い説明、詳細説明 |
| `features` | 使用技術や特徴。複数項目は全角の縦線`｜`で区切る |
| `genre` / `players` / `playTime` | ジャンル、プレイ人数、想定プレイ時間 |
| `controls` | `キー：動作`の形式。複数項目は`｜`で区切る（例：`Aボタン：ジャンプ｜Bボタン：回避`） |
| `supportedOs` | 対応OS。複数項目は`｜`で区切る |
| `systemRequirements` | 必要スペック、必須・推奨デバイスなど |
| `teamName` / `grade` / `productionYear` | 制作チーム、学年、制作年度 |
| `version` / `fileSize` / `updatedAt` | 公開バージョン、配布サイズ、更新日 |
| `downloadUrl` | 配布先のHTTPS URL |
| `thumbnail` / `mainImage` | サムネイルとメイン画像のHTTPS URLまたは相対パス |
| `screenshots` | スクリーンショットのURLまたは相対パス。複数項目は`｜`で区切る |
| `videoUrl` | 紹介動画のURL。Google Drive、YouTube、または動画ファイルのHTTPS URLを指定すると詳細ページ内で再生可能 |
| `launchInstructions` / `notes` | 起動方法と注意事項 |
| `virusCheckedAt` | 配布ファイルのウイルスチェック日 |
| `rightsChecked` | 公開に必要な権利を確認した場合にオン |
| `downloadCheckedAt` | 配布URLと配布ファイルの動作確認日 |

日付は`YYYY-MM-DD`形式で入力します。URL項目には`https://`で始まるURL、
画像項目には相対パスも使用できます。

### ピックアップ掲載

トップページへ掲載する作品は`pickup`をオンにし、`pickupOrder`へ`1`～`3`の
表示順を入力します。掲載期間を限定する場合は`pickupStartDate`と
`pickupEndDate`を入力します。有効なピックアップ作品は同時に3件以内にします。
掲載履歴を管理するときは`lastPickupDate`へ最終掲載日を記録します。

### 公開前の確認事項

- 公開対象の`id`が重複していないこと
- `id`、タイトル、説明、ジャンル、人数、操作方法、対応OS、チーム名、学年、
  制作年度、バージョン、ファイルサイズ、更新日、起動方法が入力されていること
- `rightsChecked`がオンになっていること
- `downloadUrl`がある場合、`downloadCheckedAt`が入力されていること
- 画像パスと各URLが実際に開けること
- ピックアップの掲載順と掲載期間が正しいこと

## GitHub Pages

`main`ブランチへの反映時に`.github/workflows/pages.yml`が静的ファイルを公開します。GitHubリポジトリのPages設定では、公開元としてGitHub Actionsを選択してください。
