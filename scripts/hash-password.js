// @ts-nocheck
const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function hashPassword() {
  rl.question('새 관리자 비밀번호를 입력하세요: ', async (password) => {
    if (!password || password.length < 8) {
      console.log('❌ 비밀번호는 최소 8자 이상이어야 합니다.');
      rl.close();
      return;
    }

    try {
      console.log('🔄 비밀번호를 해싱 중...');
      const hash = await bcrypt.hash(password, 12);
      
      console.log('\n✅ 해시 생성 완료!');
      console.log('\n다음 해시를 .env.local 파일의 ADMIN_PASSWORD_HASH에 설정하세요:');
      console.log(`ADMIN_PASSWORD_HASH=\\$2b\\$12\\$${hash.slice(7)}`);
      console.log('\n⚠️  주의: $ 문자 앞에 백슬래시(\\)를 꼭 붙여주세요!');
      
    } catch (error) {
      console.error('❌ 해시 생성 실패:', error);
    }
    
    rl.close();
  });
}

hashPassword();