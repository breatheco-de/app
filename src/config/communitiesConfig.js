export const COMMUNITY_TYPES = {
  WHATSAPP: 'whatsapp',
  DISCORD: 'discord',
  TELEGRAM: 'telegram',
  SLACK: 'slack',
};

export const communitiesConfig = {
  title: 'title',
  description: 'description',
  linkText: 'linkText',
  communities: [
    {
      id: 'whatsapp-es',
      name: 'whatsapp.es.name',
      type: COMMUNITY_TYPES.WHATSAPP,
      url: 'https://chat.whatsapp.com/K39ELB5TIK63r4INTBd7SG',
      language: 'es',
      description: 'whatsapp.es.description',
    },
    {
      id: 'whatsapp-en',
      name: 'whatsapp.en.name',
      type: COMMUNITY_TYPES.WHATSAPP,
      url: 'https://chat.whatsapp.com/CBppI0ulMt8Dx4Fsw9AreG',
      language: 'en',
      description: 'whatsapp.en.description',
    },
  ],
};
