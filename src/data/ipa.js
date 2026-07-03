// 英语国际音标数据（英式发音为主）
// 结构：元音 + 辅音，每个音标包含 symbol, name, examples, tip, audio 字段
// audio 路径为 placeholder，后续替换为真实音频文件

export const ipaData = {
  vowels: {
    title: '元音 Vowels',
    groups: [
      {
        name: '单元音 Monophthongs',
        sounds: [
          { symbol: 'iː', name: '长元音 iː', examples: ['sheep', 'sea', 'meet', 'feet'], tip: '嘴角向两边咧开，牙齿微微张开，舌尖抵下齿。', audio: 'audio/i_long.mp3' },
          { symbol: 'ɪ', name: '短元音 ɪ', examples: ['ship', 'sit', 'big', 'pig'], tip: '嘴角略向两边拉开，舌头平放，比 iː 更放松短促。', audio: 'audio/i_short.mp3' },
          { symbol: 'e', name: '短元音 e', examples: ['bed', 'pen', 'red', 'head'], tip: '嘴巴微微张开，舌头中部稍抬，扁扁地发"诶"。', audio: 'audio/e.mp3' },
          { symbol: 'æ', name: '短元音 æ', examples: ['cat', 'bad', 'apple', 'map'], tip: '嘴巴尽量张大，下巴下降，舌头平放。', audio: 'audio/ae.mp3' },
          { symbol: 'ɜː', name: '长元音 ɜː', examples: ['bird', 'nurse', 'work', 'girl'], tip: '嘴唇微微圆起，舌头中部抬起，舌头放松。', audio: 'audio/er_long.mp3' },
          { symbol: 'ə', name: '短元音 ə', examples: ['about', 'banana', 'sofa', 'teacher'], tip: '嘴巴自然放松微张，舌头平放，发出含糊的"呃"。', audio: 'audio/schwa.mp3' },
          { symbol: 'ʌ', name: '短元音 ʌ', examples: ['cup', 'bus', 'love', 'sun'], tip: '嘴巴半开，舌头后部稍抬，下巴下沉。', audio: 'audio/upsilon.mp3' },
          { symbol: 'uː', name: '长元音 uː', examples: ['food', 'moon', 'blue', 'shoe'], tip: '嘴唇拢圆收向前突，舌后部抬得最高，声带振动。', audio: 'audio/u_long.mp3' },
          { symbol: 'ʊ', name: '短元音 ʊ', examples: ['book', 'put', 'good', 'could'], tip: '嘴唇略圆，比 uː 放松短促，舌头后部抬起。', audio: 'audio/u_short.mp3' },
          { symbol: 'ɔː', name: '长元音 ɔː', examples: ['door', 'more', 'law', 'saw'], tip: '嘴唇微微拢圆，舌头后部抬起，下巴下沉。', audio: 'audio/o_long.mp3' },
          { symbol: 'ɒ', name: '短元音 ɒ', examples: ['hot', 'dog', 'stop', 'box'], tip: '嘴巴大张，下巴下沉，舌头后部抬起。', audio: 'audio/o_short.mp3' },
          { symbol: 'ɑː', name: '长元音 ɑː', examples: ['car', 'heart', 'father', 'arm'], tip: '嘴巴尽量张大，下巴下沉，舌头平放。', audio: 'audio/a_long.mp3' },
        ]
      },
      {
        name: '双元音 Diphthongs',
        sounds: [
          { symbol: 'eɪ', name: '双元音 eɪ', examples: ['day', 'cake', 'rain', 'name'], tip: '从 e 滑向 ɪ，像"诶-伊"。', audio: 'audio/ei.mp3' },
          { symbol: 'aɪ', name: '双元音 aɪ', examples: ['time', 'fly', 'cry', 'eye'], tip: '从 ɑː 滑向 ɪ，像"啊-伊"。', audio: 'audio/ai.mp3' },
          { symbol: 'ɔɪ', name: '双元音 ɔɪ', examples: ['boy', 'toy', 'enjoy', 'oil'], tip: '从 ɔː 滑向 ɪ，像"哦-伊"。', audio: 'audio/oi.mp3' },
          { symbol: 'aʊ', name: '双元音 aʊ', examples: ['house', 'cow', 'now', 'mouth'], tip: '从 ɑː 滑向 ʊ，像"啊-乌"。', audio: 'audio/au.mp3' },
          { symbol: 'əʊ', name: '双元音 əʊ', examples: ['go', 'home', 'boat', 'nose'], tip: '从 ə 滑向 ʊ，像"呃-乌"。', audio: 'audio/ou.mp3' },
          { symbol: 'ɪə', name: '双元音 ɪə', examples: ['ear', 'here', 'idea', 'near'], tip: '从 ɪ 滑向 ə，像"伊-呃"。', audio: 'audio/ia.mp3' },
          { symbol: 'eə', name: '双元音 eə', examples: ['air', 'care', 'bear', 'hair'], tip: '从 e 滑向 ə，像"诶-呃"。', audio: 'audio/ea.mp3' },
          { symbol: 'ʊə', name: '双元音 ʊə', examples: ['tour', 'pure', 'endure', 'cure'], tip: '从 ʊ 滑向 ə，像"乌-呃"。', audio: 'audio/ua.mp3' },
        ]
      }
    ]
  },
  consonants: {
    title: '辅音 Consonants',
    groups: [
      {
        name: '爆破音 Plosives',
        sounds: [
          { symbol: 'p', name: '清辅音 p', examples: ['pen', 'pig', 'map', 'stop'], tip: '双唇紧闭，气流突然释放，声带不振动。', audio: 'audio/p.mp3' },
          { symbol: 'b', name: '浊辅音 b', examples: ['book', 'bag', 'job', 'club'], tip: '双唇紧闭，气流突然释放，声带振动。', audio: 'audio/b.mp3' },
          { symbol: 't', name: '清辅音 t', examples: ['tea', 'top', 'cat', 'stop'], tip: '舌尖抵上齿龈，气流突然释放，声带不振动。', audio: 'audio/t.mp3' },
          { symbol: 'd', name: '浊辅音 d', examples: ['dog', 'did', 'bed', 'good'], tip: '舌尖抵上齿龈，气流突然释放，声带振动。', audio: 'audio/d.mp3' },
          { symbol: 'k', name: '清辅音 k', examples: ['cat', 'key', 'back', 'school'], tip: '舌后部抵软腭，气流突然释放，声带不振动。', audio: 'audio/k.mp3' },
          { symbol: 'ɡ', name: '浊辅音 ɡ', examples: ['go', 'girl', 'bag', 'dog'], tip: '舌后部抵软腭，气流突然释放，声带振动。', audio: 'audio/g.mp3' },
        ]
      },
      {
        name: '摩擦音 Fricatives',
        sounds: [
          { symbol: 'f', name: '清辅音 f', examples: ['fish', 'five', 'leaf', 'off'], tip: '上齿轻触下唇，气流从缝隙中摩擦通过。', audio: 'audio/f.mp3' },
          { symbol: 'v', name: '浊辅音 v', examples: ['very', 'van', 'love', 'have'], tip: '上齿轻触下唇，声带振动，像 f 但振动。', audio: 'audio/v.mp3' },
          { symbol: 'θ', name: '清辅音 θ', examples: ['think', 'three', 'mouth', 'bath'], tip: '舌尖轻触上齿，气流从舌齿间摩擦通过。', audio: 'audio/th_voiceless.mp3' },
          { symbol: 'ð', name: '浊辅音 ð', examples: ['this', 'that', 'mother', 'breathe'], tip: '舌尖轻触上齿，声带振动。', audio: 'audio/th_voiced.mp3' },
          { symbol: 's', name: '清辅音 s', examples: ['sun', 'see', 'bus', 'snake'], tip: '舌尖接近上齿龈但不接触，气流从缝隙中通过。', audio: 'audio/s.mp3' },
          { symbol: 'z', name: '浊辅音 z', examples: ['zoo', 'zebra', 'is', 'buzz'], tip: '舌尖接近上齿龈，声带振动。', audio: 'audio/z.mp3' },
          { symbol: 'ʃ', name: '清辅音 ʃ', examples: ['she', 'ship', 'fish', 'wash'], tip: '双唇微圆，舌头平放，气流从舌面和硬腭间摩擦。', audio: 'audio/sh.mp3' },
          { symbol: 'ʒ', name: '浊辅音 ʒ', examples: ['vision', 'pleasure', 'beige', 'usually'], tip: '双唇微圆，声带振动，像 ʃ 但振动。', audio: 'audio/zh.mp3' },
          { symbol: 'h', name: '清辅音 h', examples: ['he', 'hello', 'behind', 'house'], tip: '声门打开，气流直接冲出，声带不振动。', audio: 'audio/h.mp3' },
        ]
      },
      {
        name: '破擦音 Affricates',
        sounds: [
          { symbol: 'tʃ', name: '清辅音 tʃ', examples: ['chair', 'teacher', 'catch', 'watch'], tip: '先发 t，紧接着发 ʃ，声带不振动。', audio: 'audio/ch.mp3' },
          { symbol: 'dʒ', name: '浊辅音 dʒ', examples: ['job', 'jump', 'age', 'orange'], tip: '先发 d，紧接着发 ʒ，声带振动。', audio: 'audio/j.mp3' },
        ]
      },
      {
        name: '鼻音 Nasals',
        sounds: [
          { symbol: 'm', name: '浊辅音 m', examples: ['man', 'map', 'room', 'time'], tip: '双唇紧闭，气流从鼻腔通过。', audio: 'audio/m.mp3' },
          { symbol: 'n', name: '浊辅音 n', examples: ['no', 'net', 'sun', 'pen'], tip: '舌尖抵上齿龈，气流从鼻腔通过。', audio: 'audio/n.mp3' },
          { symbol: 'ŋ', name: '浊辅音 ŋ', examples: ['sing', 'ring', 'think', 'long'], tip: '舌后部抵软腭，气流从鼻腔通过。', audio: 'audio/ng.mp3' },
        ]
      },
      {
        name: '流音 / 半元音 Liquids & Semivowels',
        sounds: [
          { symbol: 'l', name: '浊辅音 l', examples: ['let', 'love', 'ball', 'yellow'], tip: '舌尖抵上齿龈，气流从舌两侧通过。', audio: 'audio/l.mp3' },
          { symbol: 'r', name: '浊辅音 r', examples: ['red', 'run', 'very', 'car'], tip: '舌尖卷起但不接触上颚，嘴唇微圆。', audio: 'audio/r.mp3' },
          { symbol: 'j', name: '半元音 j', examples: ['yes', 'you', 'yellow', 'use'], tip: '类似"耶"的音，声带振动，像 iː 但更短促。', audio: 'audio/y.mp3' },
          { symbol: 'w', name: '半元音 w', examples: ['we', 'what', 'will', 'away'], tip: '嘴唇拢圆，声带振动，像 uː 但更短促。', audio: 'audio/w.mp3' },
        ]
      }
    ]
  }
};
