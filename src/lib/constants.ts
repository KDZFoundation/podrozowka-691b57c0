export interface ThankYouPhrase {
  lang: string;
  phrase: string;
  pronunciation: string;
}

export interface GreetingsPhrase {
  lang: string;
  phrase: string;
  pronunciation: string;
}

export const thankYouPhrases: ThankYouPhrase[] = [
  { lang: "Chiński", phrase: "谢谢", pronunciation: "Xièxiè" },
  { lang: "Japoński", phrase: "ありがとう", pronunciation: "Arigatō" },
  { lang: "Koreański", phrase: "감사합니다", pronunciation: "Gamsahamnida" },
  { lang: "Tajski", phrase: "ขอบคุณ", pronunciation: "Khob khun" },
  { lang: "Arabski", phrase: "شكراً", pronunciation: "Shukran" },
  { lang: "Hindi", phrase: "धन्यवाद", pronunciation: "Dhanyavaad" },
  { lang: "Rosyjski", phrase: "Спасибо", pronunciation: "Spasibo" },
  { lang: "Niemiecki", phrase: "Danke", pronunciation: "Danke" },
  { lang: "Francuski", phrase: "Merci", pronunciation: "Mersi" },
  { lang: "Hiszpański", phrase: "Gracias", pronunciation: "Grasias" },
  { lang: "Włoski", phrase: "Grazie", pronunciation: "Gracie" },
  { lang: "Portugalski", phrase: "Obrigado", pronunciation: "Obrigadu" },
  { lang: "Holenderski", phrase: "Dank u", pronunciation: "Dank ü" },
  { lang: "Szwedzki", phrase: "Tack", pronunciation: "Tak" },
  { lang: "Norweski", phrase: "Takk", pronunciation: "Tak" },
  { lang: "Angielski", phrase: "Thank you", pronunciation: "Thank you" },
];

export const greetingsPhrases: GreetingsPhrase[] = [
  { lang: "Chiński", phrase: "来自波兰的问候", pronunciation: "Láizì bōlán de wènhòu" },
  { lang: "Japoński", phrase: "ポーランドからのご挨拶", pronunciation: "Pōrando kara no go-aisatsu" },
  { lang: "Koreański", phrase: "폴란드에서 인사드립니다", pronunciation: "Pollandeu-eseo insadeurimnida" },
  { lang: "Niemiecki", phrase: "Grüße aus Polen", pronunciation: "Grüsse aus Polen" },
  { lang: "Francuski", phrase: "Salutations de Pologne", pronunciation: "Salütasion de Poloñ" },
  { lang: "Hiszpański", phrase: "Saludos desde Polonia", pronunciation: "Saludos desde Polonia" },
];
