//TODO: 関数exportをするとbuildしたコードがGAS環境で動作しなくなるためテストコードは保留
// import { buildQueryParams, splitIntoGroups, execGetSpecificMessageReactions } from '../src/main';

// execGetSpecificMessageReactionsをモック
// jest.mock('../src/main', () => {
//   return {
//     ...jest.requireActual('../src/main'),
//     execGetSpecificMessageReactions: jest.fn(),
//   };
// });

// describe('クエリパラメータの構築', () => {
//   it('空のオブジェクトからクエリパラメータを構築する', () => {
//     const result = buildQueryParams({});
//     expect(result).toBe('');
//   });

//   it('単一のキーと値からクエリパラメータを構築する', () => {
//     const result = buildQueryParams({ key: 'value' });
//     expect(result).toBe('key=value');
//   });

//   it('複数のキーと値からクエリパラメータを構築する', () => {
//     const result = buildQueryParams({ key1: 'value1', key2: 'value2' });
//     expect(result).toBe('key1=value1&key2=value2');
//   });

// });

// describe('ユーザーをグループに分ける', () => {
//   it('ユーザー数が少ない場合は一つのグループにする', () => {
//     const users = ['user1', 'user2', 'user3'];
//     const groups = splitIntoGroups(users, 3, 4);
//     expect(groups).toEqual([['user1', 'user2', 'user3']]);
//   });

//   it('ユーザー数が多い場合は指定したサイズでグループに分ける', () => {
//     const users = ['user1', 'user2', 'user3', 'user4', 'user5', 'user6'];
//     const groups = splitIntoGroups(users, 3, 3);
//     expect(groups).toEqual([
//       ['user1', 'user2','user3'],
//       ['user4', 'user5','user6'],
//     ]);
//   });

//   it('最小グループサイズを満たしていない場合、残りを追加する', () => {
//     const users = ['user1', 'user2', 'user3', 'user4', 'user5'];
//     const groups = splitIntoGroups(users, 3, 4);
//     expect(groups).toEqual([
//       ['user1', 'user2', 'user3','user4', 'user5'],
//     ]);
//   });

//   it('一人の場合は一つのグループにする', () => {
//     const users = ['user1'];
//     const groups = splitIntoGroups(users, 3, 4);
//     expect(groups).toEqual([['user1']]);
//   });
// });
