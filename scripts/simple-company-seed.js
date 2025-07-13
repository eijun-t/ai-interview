// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// 手動で作成した企業リスト（サンプル）
const SAMPLE_COMPANIES = [
  // IT・ソフトウェア
  { name: 'トヨタ自動車株式会社', industry: 'メーカー・製造業' },
  { name: 'ソニーグループ株式会社', industry: 'メーカー・製造業' },
  { name: 'パナソニックホールディングス株式会社', industry: 'メーカー・製造業' },
  { name: '日立製作所', industry: 'メーカー・製造業' },
  { name: '三菱電機株式会社', industry: 'メーカー・製造業' },
  
  // 商社
  { name: '三菱商事株式会社', industry: '商社・貿易' },
  { name: '三井物産株式会社', industry: '商社・貿易' },
  { name: '伊藤忠商事株式会社', industry: '商社・貿易' },
  { name: '住友商事株式会社', industry: '商社・貿易' },
  { name: '丸紅株式会社', industry: '商社・貿易' },
  
  // 金融
  { name: '三菱UFJ銀行', industry: '金融' },
  { name: '三井住友銀行', industry: '金融' },
  { name: 'みずほ銀行', industry: '金融' },
  { name: '野村證券株式会社', industry: '金融' },
  { name: '大和証券株式会社', industry: '金融' },
  
  // IT・ソフトウェア
  { name: '株式会社NTTデータ', industry: 'IT・ソフトウェア' },
  { name: '富士通株式会社', industry: 'IT・ソフトウェア' },
  { name: 'NEC（日本電気株式会社）', industry: 'IT・ソフトウェア' },
  { name: '株式会社野村総合研究所', industry: 'IT・ソフトウェア' },
  { name: 'TIS株式会社', industry: 'IT・ソフトウェア' },
  
  // コンサルティング
  { name: 'アクセンチュア株式会社', industry: 'コンサルティング' },
  { name: 'デロイト トーマツ コンサルティング', industry: 'コンサルティング' },
  { name: 'PwCコンサルティング合同会社', industry: 'コンサルティング' },
  { name: 'EYストラテジー・アンド・コンサルティング', industry: 'コンサルティング' },
  
  // 広告・マーケティング
  { name: '株式会社電通', industry: '広告・マーケティング' },
  { name: '株式会社博報堂', industry: '広告・マーケティング' },
  { name: 'ADKホールディングス株式会社', industry: '広告・マーケティング' },
  { name: '株式会社サイバーエージェント', industry: '広告・マーケティング' }
];

async function getIndustryId(industryName) {
  const { data, error } = await supabase
    .from('industries')
    .select('id')
    .eq('name', industryName)
    .single();
    
  if (error) {
    console.log(`Industry not found: ${industryName}`);
    return null;
  }
  
  return data.id;
}

async function seedSampleCompanies() {
  console.log('Seeding sample companies...');
  
  const companiesWithIndustryIds = [];
  
  for (const company of SAMPLE_COMPANIES) {
    const industryId = await getIndustryId(company.industry);
    
    companiesWithIndustryIds.push({
      name: company.name,
      industry_id: industryId,
      description: `${company.industry}業界の代表的な企業`,
      source_url: 'manual_seed'
    });
  }
  
  console.log(`Inserting ${companiesWithIndustryIds.length} sample companies...`);
  
  const { data, error } = await supabase
    .from('companies')
    .upsert(companiesWithIndustryIds, { 
      onConflict: 'name',
      ignoreDuplicates: true 
    });
  
  if (error) {
    console.error('Error inserting companies:', error);
  } else {
    console.log('Sample companies inserted successfully!');
    console.log(`Inserted: ${companiesWithIndustryIds.length} companies`);
  }
}

// メイン実行
if (require.main === module) {
  seedSampleCompanies()
    .then(() => {
      console.log('Sample seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Sample seeding failed:', error);
      process.exit(1);
    });
}