export type Creator = {
  id: string;
  name: string;
  title: string;
  chats: string;
  about: string;
  tags: string[];
  questions: string[];
  cardImg: string;
  modalImg: string;
};

export const CREATORS: Creator[] = [
  {
    id: "raghav",
    name: "Raghav Budhraja",
    title: "Weight loss expert",
    chats: "500+ Chats",
    about:
      "Lost 25kg, founder of PeakPals, helped 400+ clients globally using structured fat loss systems, data-driven nutrition, and personalized training.",
    tags: ["Cross fit", "Weight Loss", "Diet training"],
    questions: [
      "How do I lose belly fat?",
      "How much protein should I eat?",
      "What workout should I follow?",
    ],
    cardImg: "/website/figma/Group%2048095687.png",
    modalImg: "/website/figma/raghav.png",
  },
  {
    id: "krishansh",
    name: "Krishansh Arora",
    title: "Muscle building expert",
    chats: "400+ Chats",
    about:
      "Gained 15kg of lean muscle, founder of IronLab, coached 300+ clients globally with progressive overload programs, sports nutrition, and functional hypertrophy training.",
    tags: ["Strength", "Muscle Building", "Hypertrophy"],
    questions: [
      "How do I build muscle fast?",
      "What should I eat post-workout?",
      "How often should I train?",
    ],
    cardImg: "/website/figma/Group%2048095689.png",
    modalImg: "/website/figma/krishansh.png",
  },
  {
    id: "ravya",
    name: "Ravya Arora",
    title: "PCOS & wellness expert",
    chats: "350+ Chats",
    about:
      "Managed PCOS naturally, certified women's health coach, helped 250+ women balance hormones with cycle-synced training, inflammation-friendly nutrition, and lifestyle design.",
    tags: ["PCOS", "Hormone Health", "Women's Fitness"],
    questions: [
      "How do I manage PCOS naturally?",
      "What's the best diet for hormones?",
      "How do I lose weight with PCOS?",
    ],
    cardImg: "/website/figma/Group%2048095682.png",
    modalImg: "/website/figma/ravya.png",
  },
];
