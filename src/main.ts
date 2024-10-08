/** GASプロパティ */
const GAS_PROPERTY_SLACK_API_TOKEN = 'SLACK_API_TOKEN';
const GAS_PROPERTY_CHANNEL_ID = 'CHANNEL_ID';
/** Slack API URL */
const SLACK_API_URL_HISTORY = 'https://slack.com/api/conversations.history';
const SLACK_API_URL_REACTIONS = 'https://slack.com/api/reactions.get';
const SLACK_API_URL_POST_MESSAGE = 'https://slack.com/api/chat.postMessage';
/** メッセージ */
const MESSAGE_SHUFFLE_LUNCH = 'リマインダー : 次回金曜日のシャッフルランチ参加者を募集します！';
const MESSAGE_NO_PARTICIPANTS = '今回は参加者がいませんでした。次回の参加をお待ちしています。';
/** 参加集計対象とするSlackのリアクション絵文字 */
const TARGET_REACTIONS = ['man-gesturing-ok', 'woman-gesturing-ok'];

function getSlackApiToken(): string | null {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty(GAS_PROPERTY_SLACK_API_TOKEN);
}

function getChannelId(): string | null {
  const scriptProperties = PropertiesService.getScriptProperties();
  return scriptProperties.getProperty(GAS_PROPERTY_CHANNEL_ID);
}

const buildQueryParams = (params: Record<string, any>): string => {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

//** メッセージのリアクションを取得する */
function getSpecificMessageReactions(channelId: string, slackToken: string) {
  const historyParams = {
    channel: channelId,
    limit: String(100),
  };

  const options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'get' as GoogleAppsScript.URL_Fetch.HttpMethod,
    headers: {
      'Authorization': `Bearer ${slackToken}`,
      'Content-Type': 'application/json',
    },
    muteHttpExceptions: true,
  };

  const historyResponse = UrlFetchApp.fetch(`${SLACK_API_URL_HISTORY}?${buildQueryParams(historyParams)}`, options);
  const historyJson = JSON.parse(historyResponse.getContentText());

  if (historyJson.ok && historyJson.messages.length > 0) {
    const specificMessage = historyJson.messages.find((message: { text: string }) =>
      message.text.startsWith(MESSAGE_SHUFFLE_LUNCH)
    );

    if (specificMessage) {
      const messageTs = specificMessage.ts;
      const reactionParams = { channel: channelId, timestamp: messageTs };

      const reactionsResponse = UrlFetchApp.fetch(`${SLACK_API_URL_REACTIONS}?${buildQueryParams(reactionParams)}`, options);
      const reactionsJson = JSON.parse(reactionsResponse.getContentText());

      if (reactionsJson.ok) {
        const reactions = reactionsJson.message.reactions;

        if (!reactions || reactions.length === 0) {
          sendNoParticipantsMessage(channelId, slackToken);
          return null;
        }

        let reactingUsers: string[] = [];

        reactions.forEach((reaction: { name: string; users: string[] }) => {
          if (TARGET_REACTIONS.some(target => reaction.name.startsWith(target))) {
            reactingUsers = reactingUsers.concat(reaction.users);
          }
        });

        reactingUsers = [...new Set(reactingUsers)].sort(() => Math.random() - 0.5);

        if (reactingUsers.length > 0) {
          const groups = splitIntoGroups(reactingUsers, 3, 4);
          sendGroupMessages(groups, channelId, slackToken);
          return { groups };
        } else {
          sendNoParticipantsMessage(channelId, slackToken);
          return null;
        }
      } else {
        Logger.log(`Error fetching reactions: ${reactionsJson.error}`);
        return null;
      }
    } else {
      Logger.log('No specific message found.');
      return null;
    }
  } else {
    Logger.log(`Error fetching messages: ${historyJson.error}`);
    return null;
  }
}

//** リアクションがない場合にメッセージを送信する */ 
function sendNoParticipantsMessage(channelId: string, slackToken: string): void {
  const postMessageParams = {
    channel: channelId,
    text: MESSAGE_NO_PARTICIPANTS,
  };

  const postMessageOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    method: 'post' as GoogleAppsScript.URL_Fetch.HttpMethod,
    headers: {
      'Authorization': `Bearer ${slackToken}`,
      'Content-Type': 'application/json',
    },
    payload: JSON.stringify(postMessageParams),
    muteHttpExceptions: true,
  };

  const postMessageResponse = UrlFetchApp.fetch(SLACK_API_URL_POST_MESSAGE, postMessageOptions);
  const postMessageJson = JSON.parse(postMessageResponse.getContentText());

  if (!postMessageJson.ok) {
    Logger.log(`Error posting message: ${postMessageJson.error}`);
  }
}

//** ユーザーをグループに分ける */
const splitIntoGroups = (users: string[], minGroupSize: number, maxGroupSize: number): string[][] => {
  const groups: string[][] = [];

  // 5人以下の場合、全員を1グループにする
  if (users.length <= 5) {
    groups.push(users);
    return groups;
  }

  // グループの数を計算する
  const totalGroups = Math.ceil(users.length / maxGroupSize);

  // 各グループに適切な人数を割り当てる
  let startIndex = 0;
  for (let i = 0; i < totalGroups; i++) {
    // 残り人数に応じてグループサイズを決める
    const remainingUsers = users.length - startIndex;
    const groupSize = Math.min(maxGroupSize, Math.max(minGroupSize, Math.floor(remainingUsers / (totalGroups - i))));

    // グループを作成して追加
    groups.push(users.slice(startIndex, startIndex + groupSize));
    startIndex += groupSize;
  }

  return groups;
};

//** グループごとにメッセージを送信する */
function sendGroupMessages(groups: string[][], channelId: string, slackToken: string): void {
  groups.forEach((group, index) => {
    const groupName = String.fromCharCode(65 + index);
    const userMentions = group.map(userId => `<@${userId}>`).join(' ');
    const message = `${userMentions}\nシャッフルランチ参加ありがとうございます。\nみなさんはグループ${groupName}になります。スレッド内で調整お願いします。`;

    const postMessageParams = {
      channel: channelId,
      text: message,
    };

    const postMessageOptions: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
      method: 'post' as GoogleAppsScript.URL_Fetch.HttpMethod,
      headers: {
        'Authorization': `Bearer ${slackToken}`,
        'Content-Type': 'application/json',
      },
      payload: JSON.stringify(postMessageParams),
      muteHttpExceptions: true,
    };

    const postMessageResponse = UrlFetchApp.fetch(SLACK_API_URL_POST_MESSAGE, postMessageOptions);
    const postMessageJson = JSON.parse(postMessageResponse.getContentText());

    if (!postMessageJson.ok) {
      Logger.log(`Error posting message: ${postMessageJson.error}`);
    }
  });
}

/* MEMO: 
  GASの実行とTypeScriptのビルドの関係で実行フラグを用意している
  GASで実行する際は、関数指定をするため「execGetSpecificMessageReactions」を指定して実行する。
  TSからJSにビルドする際に実行対象の関数のみビルドされるのでグローバルに「execGetSpecificMessageReactions」を定義している。
  単純に「execGetSpecificMessageReactions」を実行すると、2回実行されてしまう。
  手動でコード修正を行わずに「execGetSpecificMessageReactions」実行を1回にするために実行フラグを管理している。
*/

// メイン実行フラグ
let execCalled = false;

//** メイン */ 
function execGetSpecificMessageReactions() {
  if (!execCalled) {
    const slackToken = getSlackApiToken();
    const channelId = getChannelId();
    if (slackToken && channelId) {
      getSpecificMessageReactions(channelId, slackToken);
    } else {
      Logger.log("Slack API Token or Channel ID is missing.");
    }
    execCalled = true;
  }
}

// メイン関数のグローバル定義
execGetSpecificMessageReactions();
