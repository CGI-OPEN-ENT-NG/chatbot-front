export class Config {
  name: string;
  function: string;
  icon: string;
  primaryColor: string;
  secondaryColor: string;
  mediaSize: number;
  trainingRasa: boolean;
  needTraining: boolean;
  lastTrainingAt: string;
  storage: boolean;
  apiKey: string;

  // EMBEDDED
  embeddedIcon: string;
  description: string;
  help: string;
  helpBtn: string;
  chatBtn: string;
  faqBtn: string;
  showFaq: boolean;
  showFallbackSuggestions: boolean;

  // DESCRIPTION
  problematic: string;
  audience: string;

  // CONFIG
  showIntentSearch: boolean;
  delayBetweenMessages: number;
  isTree: boolean;
}
