# Student Game Gallery

授業で制作された学生ゲーム作品を紹介する静的Webサイトです。

## ローカル確認

ファイルを直接開くのではなく、プロジェクトのルートでローカルWebサーバーを起動してください。

```powershell
python -m http.server 8000
```

ブラウザで`http://localhost:8000/`を開きます。

## 作品データ

公開用データは`data/games.json`に保存します。現在の内容は画面確認用のサンプルです。本番公開前に、Googleスプレッドシートに紐づけたGASから出力した`games.json`へ置き換えてください。

画像は`assets/images/games/<作品ID>/`へ配置し、JSONへ相対パスを登録します。

## GoogleスプレッドシートとGAS

`gas/`内のファイルを、管理用スプレッドシートに紐づくApps Scriptへ登録します。

- `Code.gs`：シート初期設定、入力検証、JSON変換、作品追加処理
- `GameForm.html`：新しい作品を追加するサイドバーフォーム
- `DownloadDialog.html`：検証済みJSONのダウンロード画面

スプレッドシートを再読み込みすると「作品データ」メニューが表示されます。「新しい作品を追加」から作品を下書き登録し、権利・動作確認後にシート上で公開設定を行います。

## GitHub Pages

`main`ブランチへの反映時に`.github/workflows/pages.yml`が静的ファイルを公開します。GitHubリポジトリのPages設定では、公開元としてGitHub Actionsを選択してください。
