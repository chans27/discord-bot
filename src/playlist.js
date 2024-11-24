/**
 * !목록 또는 !playlist 입력 했을때의 처리
 */
const { queue, musicTitle } = require('./utils/musicUtils');

async function checkPlaylist(message) {
  if (queue.length === 0) {
    message.reply('현재 대기열에 곡이 없습니다.');
    return;
  }

  // 디스코드의 메세지 응답 창
  const embed = {
    color: 0x0099ff,
    title: '플레이 리스트',
    description: queue.length === 1 ?
      `현재 대기 중인 곡: **${musicTitle[0]}**` :
      `대기 중인 곡들:\n${musicTitle.slice(1).map((title, index) => `${index + 1}. ${title}`).join('\n')}`,
    timestamp: new Date(),
  };

  message.reply({ embeds: [embed] });
}

module.exports = { checkPlaylist };
