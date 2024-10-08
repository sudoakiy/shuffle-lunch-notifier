# Shuffle Lunch Notifier

このプロジェクトは、Slackを使用してシャッフルランチの参加者を自動で募集するためのスクリプトです。指定されたメッセージにリアクションしたユーザーをグループに分けて通知します。

## 目次
- [背景](#背景)
- [特徴](#特徴)
- [セットアップ](#セットアップ)
- [デプロイ](#デプロイ方法)
- [使用方法](#使用方法)

## 背景

シャッフルランチはチームの絆を深める素晴らしい方法ですが、参加者の募集と管理は手間がかかることがあります。このプロジェクトは、そのプロセスを簡略化し、参加者を自動的に管理することを目的としています。

## 特徴

- Slack APIを使用したメッセージの取得とリアクションの管理
- リアクションに基づいたユーザーのグループ分け
- グループごとの通知メッセージ送信
- 参加者がいない場合の通知機能

## セットアップ

0. claspをインストールしておいてください。
   - ex. `npm install -g @google/clasp`

1. リポジトリをクローンします。
```bash
   git clone https://github.com/your-username/shuffle-lunch-notifier.git
   cd shuffle-lunch-notifier
```
2. 必要な依存関係をインストールします。
```bash
npm install
```
3. claspにログインし、claspプロジェクトを作成します。
   - ex1. `clasp login`
   - ex2. `clasp create --title "shuffle-lunch-notifier"`

4. `.clasp.json`ファイルを編集して、rootDirを"dist"に変更してください。GAS上のスクリプトプロパティでSlack APIトークン（`SLACK_API_TOKEN`）とチャンネルID（`CHANNEL_ID`）を追加してください。

5. TypeScriptをビルドします。

```bash
npm run build
```

## デプロイ方法

1. デプロイします。連携したGASプロジェクトに反映されます。
```bash
npm run deploy
```

## 使用方法

1. GASスクリプトエディタ上で`execGetSpecificMessageReactions()`を実行すると実行できます。必要に応じてスケジューリング設定してください。GASスクリプトエディタ上で設定可能です。

## Slackbotの設定補足
Botを該当チャンネルに参加させておいてください。
* Bot Token Scopes
    * channels:history
    * channels:read
    * chat:write
    * reactions:read
