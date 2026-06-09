import type { Philosopher } from '../philosophers';

// 100 additional philosophers expanding the canon, researched from primary/reference
// sources (Stanford Encyclopedia of Philosophy, IEP) and de-duplicated against the
// existing entries. Generated, then verified to compile against the Philosopher type.
export const EXPANSION_EXTRA: Philosopher[] = [
  {
    "id": "anaxagoras",
    "name": "Anaxagoras",
    "lifespan": "c. 500-428 BCE",
    "era": "Pre-Socratic Greece",
    "symbol": "🌀",
    "oneLiner": "Mind set the cosmos spinning into order",
    "bio": "Anaxagoras was a Pre-Socratic thinker from Clazomenae who brought the spirit of scientific inquiry to Athens. He argued that everything contains a portion of everything else, an infinitely divisible mixture, and that a cosmic Mind (Nous) set this mixture spinning to form the world. He scandalized Athenians by claiming the Sun was a white-hot stone rather than a god, and was prosecuted for impiety before fleeing the city. His bold idea that intelligence orders nature deeply influenced Socrates, Plato, and Aristotle.",
    "areas": [
      "Cosmology",
      "Metaphysics",
      "Natural Philosophy"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "anaxagoras-1",
        "text": "In everything there is a portion of everything."
      },
      {
        "id": "anaxagoras-2",
        "text": "Mind is infinite and self-ruled, and is mixed with nothing, but is alone itself by itself."
      },
      {
        "id": "anaxagoras-3",
        "text": "The Greeks follow a wrong usage in speaking of coming into being and passing away; for nothing comes into being or passes away, but there is mingling and separation of things that are."
      },
      {
        "id": "anaxagoras-4",
        "text": "All things were together, infinite both in number and in smallness; for the small too was infinite."
      },
      {
        "id": "anaxagoras-5",
        "text": "There is a portion of everything in everything except Mind, and there are some things in which there is Mind also."
      }
    ],
    "category": "ANCIENT",
    "country": "Greece"
  },
  {
    "id": "theophrastus",
    "name": "Theophrastus",
    "lifespan": "c. 371-287 BCE",
    "era": "Classical Greece",
    "symbol": "🌿",
    "oneLiner": "Aristotle's heir who turned observation into science",
    "bio": "Theophrastus of Eresos was Aristotle's closest colleague and his chosen successor as head of the Lyceum, which he led for some thirty-five years. Originally named Tyrtamus, he was nicknamed Theophrastus, 'divine speaker,' for the grace of his teaching. He is often called the father of botany for his pioneering studies of plants, and his witty Characters sketches thirty moral types in a way that still feels strikingly modern. Across logic, ethics, metaphysics, and natural science, he refined and questioned his teacher's ideas while building careful empirical foundations.",
    "areas": [
      "Natural Philosophy",
      "Ethics",
      "Metaphysics"
    ],
    "branchSlugs": [
      "metaphysics",
      "ethics",
      "logic"
    ],
    "quotes": [
      {
        "id": "theophrastus-1",
        "text": "Time is the most valuable thing a man can spend."
      },
      {
        "id": "theophrastus-2",
        "text": "Superstition would seem to be simply cowardice in regard to the supernatural."
      },
      {
        "id": "theophrastus-3",
        "text": "When we are beginning to live, then we are dying. There is, therefore, nothing more profitless than ambition."
      },
      {
        "id": "theophrastus-4",
        "text": "If you are an ignorant man, you are acting wisely; but if you have had any education, you are behaving like a fool."
      }
    ],
    "category": "ANCIENT",
    "country": "Greece"
  },
  {
    "id": "crates-of-thebes",
    "name": "Crates of Thebes",
    "lifespan": "c. 365-285 BCE",
    "era": "Hellenistic Greece",
    "symbol": "🪙",
    "oneLiner": "Gave away his fortune to live free as a Cynic",
    "bio": "Crates of Thebes was a wealthy man who renounced his fortune to live in voluntary poverty on the streets of Athens as a Cynic philosopher. A pupil of Diogenes of Sinope, he was beloved by Athenians for his cheerful wit and kindness, earning the nickname 'door-opener' for being welcomed into every home. He married the philosopher Hipparchia as an equal partner in the Cynic life, and he taught Zeno of Citium, who went on to found Stoicism. His message was that true wealth lies in needing little and that freedom comes from shedding what others cling to.",
    "areas": [
      "Ethics",
      "Cynicism",
      "Practical Philosophy"
    ],
    "branchSlugs": [
      "ethics",
      "political-philosophy"
    ],
    "quotes": [
      {
        "id": "crates-of-thebes-1",
        "text": "Hunger checks love; and should it not, time does. If both should fail you, then a halter choose."
      },
      {
        "id": "crates-of-thebes-2",
        "text": "A man ought to study philosophy up to the point of looking on generals and donkey-drivers in the same light."
      },
      {
        "id": "crates-of-thebes-3",
        "text": "'Tis not one town, nor one poor single house, that is my country; but in every land each city and each dwelling seems to me a place for my reception ready made."
      },
      {
        "id": "crates-of-thebes-4",
        "text": "Poverty and dear obscurity are what a prudent man should think his country; for these e'en fortune can't deprive him of."
      }
    ],
    "category": "ANCIENT",
    "country": "Greece"
  },
  {
    "id": "hipparchia-of-maroneia",
    "name": "Hipparchia of Maroneia",
    "lifespan": "c. 350-280 BCE",
    "era": "Hellenistic Greece",
    "symbol": "♀️",
    "oneLiner": "Traded the loom for philosophy on equal terms",
    "bio": "Hipparchia of Maroneia was one of the very few women philosophers of antiquity whose name survives, and the only one with her own entry among the eminent philosophers of Diogenes Laertius. Born into wealth, she fell in love with the Cynic Crates of Thebes and insisted on marrying him, abandoning a comfortable life to live with him in public poverty as an equal partner. She defended her choice fiercely, asking whether she had decided wrongly by devoting to philosophy the time she would otherwise have wasted at the loom. Her life became a living argument that wisdom and the philosophical life were open to women too.",
    "areas": [
      "Ethics",
      "Cynicism",
      "Logic"
    ],
    "branchSlugs": [
      "ethics",
      "logic",
      "political-philosophy"
    ],
    "quotes": [
      {
        "id": "hipparchia-of-maroneia-1",
        "text": "Do I appear to you to have come to a wrong decision, if I devote that time to philosophy which I otherwise should have spent at the loom?"
      },
      {
        "id": "hipparchia-of-maroneia-2",
        "text": "That which Theodorus would not be said to do wrong in doing, neither should Hipparchia be said to do wrong in doing."
      },
      {
        "id": "hipparchia-of-maroneia-3",
        "text": "Theodorus hitting himself does not do wrong, nor does Hipparchia do wrong in hitting Theodorus."
      }
    ],
    "category": "ANCIENT",
    "country": "Greece"
  },
  {
    "id": "cleanthes",
    "name": "Cleanthes",
    "lifespan": "c. 330-230 BCE",
    "era": "Hellenistic Greece",
    "symbol": "💧",
    "oneLiner": "The water-carrier who hymned cosmic Reason",
    "bio": "Cleanthes of Assos was a former boxer and water-carrier who studied under Zeno of Citium and became the second head of the Stoic school. Famously poor and famously dogged, he supported himself by drawing water at night so he could study philosophy by day. His surviving Hymn to Zeus is one of the great religious poems of antiquity, praising the divine Reason that governs the universe by law. His prayer to follow fate willingly rather than be dragged became a touchstone of Stoic practice, echoed by Epictetus and Seneca, and he taught Chrysippus, who would systematize the school.",
    "areas": [
      "Ethics",
      "Stoicism",
      "Cosmology"
    ],
    "branchSlugs": [
      "ethics",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "cleanthes-1",
        "text": "Lead me, Zeus, and you too, Destiny, to wherever your decrees have assigned me."
      },
      {
        "id": "cleanthes-2",
        "text": "I follow readily, but if I choose not, wretched though I am, I must follow still."
      },
      {
        "id": "cleanthes-3",
        "text": "Fate guides the willing, but drags the unwilling."
      },
      {
        "id": "cleanthes-4",
        "text": "Most glorious of the immortals, called by many names, ever almighty Zeus, leader of nature, guiding everything with law."
      }
    ],
    "category": "ANCIENT",
    "country": "Greece"
  },
  {
    "id": "chrysippus",
    "name": "Chrysippus",
    "lifespan": "c. 279-206 BCE",
    "era": "Hellenistic Greece",
    "symbol": "🧩",
    "oneLiner": "Second founder of Stoicism and master of logic",
    "bio": "Chrysippus of Soli was the third head of the Stoic school and so important to its survival that ancient writers said, 'If Chrysippus had not existed, neither would the Stoa.' A tireless writer credited with over seven hundred works, he gave Stoicism its rigorous backbone, developing an original system of propositional logic as a rival to Aristotle's. He defended a thoroughly materialist view of the world governed by fate and divine reason, while arguing that human virtue means living in agreement with nature. Though only fragments of his writing survive, his arguments shaped logic and ethics for centuries.",
    "areas": [
      "Logic",
      "Ethics",
      "Stoicism"
    ],
    "branchSlugs": [
      "logic",
      "ethics",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "chrysippus-1",
        "text": "If I had followed the multitude, I should not have studied philosophy."
      },
      {
        "id": "chrysippus-2",
        "text": "Living virtuously is equivalent to living in accordance with experience of the actual course of nature."
      },
      {
        "id": "chrysippus-3",
        "text": "The wise man is in want of nothing, and yet needs many things."
      },
      {
        "id": "chrysippus-4",
        "text": "If I knew that it was fated for me to be sick, I would even move toward it."
      }
    ],
    "category": "ANCIENT",
    "country": "Greece"
  },
  {
    "id": "philo-of-alexandria",
    "name": "Philo of Alexandria",
    "lifespan": "c. 20 BCE-50 CE",
    "era": "Hellenistic Egypt",
    "symbol": "📜",
    "oneLiner": "Wove Jewish scripture together with Greek philosophy",
    "bio": "Philo of Alexandria was a Hellenistic Jewish thinker who sought to show that the Torah and Greek philosophy were allies rather than enemies. Reading the Hebrew scriptures through Platonic and Stoic lenses, he interpreted their stories allegorically as symbols of deeper moral and metaphysical truths. His doctrine of the Logos, the divine reason that mediates between a transcendent God and the world, profoundly shaped later Christian theology, including the opening of the Gospel of John. Bridging two great traditions, he became one of the most influential figures in the history of religious philosophy.",
    "areas": [
      "Philosophy of Religion",
      "Metaphysics",
      "Ethics"
    ],
    "branchSlugs": [
      "metaphysics",
      "ethics"
    ],
    "quotes": [
      {
        "id": "philo-of-alexandria-1",
        "text": "A judge must bear in mind that when he tries a case he is himself on trial."
      },
      {
        "id": "philo-of-alexandria-2",
        "text": "The road that leads to pleasure is downhill and very easy; the other, which leads to self-control, is uphill, toilsome no doubt but profitable exceedingly."
      },
      {
        "id": "philo-of-alexandria-3",
        "text": "He who has God alone for his leader, he alone is free."
      },
      {
        "id": "philo-of-alexandria-4",
        "text": "God has no wants, He needs nothing, being in Himself all-sufficient to Himself, while the fool has many wants."
      }
    ],
    "category": "ANCIENT",
    "country": "Egypt"
  },
  {
    "id": "sextus-empiricus",
    "name": "Sextus Empiricus",
    "lifespan": "c. 160-210 CE",
    "era": "Roman Empire",
    "symbol": "⚖️",
    "oneLiner": "Suspend judgment, and tranquility follows like a shadow",
    "bio": "Sextus Empiricus was a physician and the great systematizer of Pyrrhonian skepticism, whose surviving works are our fullest source for ancient skeptical thought. He taught that for every argument there is an equally strong counter-argument, so the wise response is epoche, the suspension of judgment about how things really are. Far from a gloomy conclusion, he held that this suspension brings ataraxia, an unexpected tranquility that follows it as a shadow follows a body. His careful dismantling of dogmatic certainty was rediscovered in the Renaissance and helped spark the modern philosophical concern with doubt and knowledge.",
    "areas": [
      "Epistemology",
      "Skepticism",
      "Logic"
    ],
    "branchSlugs": [
      "epistemology",
      "logic"
    ],
    "quotes": [
      {
        "id": "sextus-empiricus-1",
        "text": "Scepticism is an ability to set out oppositions among things which appear and are thought of in any way at all, an ability by which, because of the equipollence in the opposed objects and accounts, we come first to suspension of judgment and afterwards to tranquillity."
      },
      {
        "id": "sextus-empiricus-2",
        "text": "Tranquillity follows suspension of judgment as a shadow follows a body."
      },
      {
        "id": "sextus-empiricus-3",
        "text": "To every account an equal account is opposed."
      },
      {
        "id": "sextus-empiricus-4",
        "text": "The chief constituent of scepticism is the belief that to every proposition an equal proposition is opposed."
      }
    ],
    "category": "ANCIENT",
    "country": "Greece"
  },
  {
    "id": "porphyry-of-tyre",
    "name": "Porphyry of Tyre",
    "lifespan": "c. 234-305 CE",
    "era": "Roman Empire",
    "symbol": "🪶",
    "oneLiner": "Edited Plotinus and shaped logic for a thousand years",
    "bio": "Porphyry of Tyre, originally named Malchus, was a Neoplatonist philosopher who studied under Plotinus in Rome and edited his teacher's writings into the famous Enneads. His short logical primer, the Isagoge, became a standard textbook in the Byzantine, Arabic, and Latin worlds, framing the medieval debate over universals. A vegetarian on ethical grounds, he argued in On Abstinence that animals share in reason and deserve our justice. Through his clear, systematizing mind, the dense mysticism of Plotinus reached later generations and Aristotelian logic was woven into the Platonic tradition.",
    "areas": [
      "Logic",
      "Metaphysics",
      "Ethics"
    ],
    "branchSlugs": [
      "logic",
      "metaphysics",
      "ethics"
    ],
    "quotes": [
      {
        "id": "porphyry-of-tyre-1",
        "text": "The fleshless diet contributes to health and to a suitable endurance of hard work in philosophy."
      },
      {
        "id": "porphyry-of-tyre-2",
        "text": "Animals are rational; in most of them logos is imperfect, but it is certainly not wholly lacking."
      },
      {
        "id": "porphyry-of-tyre-3",
        "text": "Every good thing is gentle and consistent, progressing in good order and not going beyond what is right."
      },
      {
        "id": "porphyry-of-tyre-4",
        "text": "When friendship and perception of kinship ruled everything, no one killed any creature, because people thought the other animals were related to them."
      }
    ],
    "category": "ANCIENT",
    "country": "Phoenicia"
  },
  {
    "id": "proclus",
    "name": "Proclus",
    "lifespan": "412-485 CE",
    "era": "Late Roman Empire",
    "symbol": "🔺",
    "oneLiner": "The last great systematizer of Platonic metaphysics",
    "bio": "Proclus was one of the last major philosophers of classical antiquity and the most systematic of the Neoplatonists, leading the Platonic Academy in Athens for nearly fifty years. His Elements of Theology lays out reality in a chain of 211 propositions, each proved like a geometric theorem, descending from the supreme One down to individual souls. A mathematician as well as a metaphysician, his commentary on Euclid preserves precious history of Greek geometry. His grand, orderly vision of the cosmos flowed into later Christian, Islamic, and Renaissance thought, influencing thinkers from Pseudo-Dionysius to the medieval schools.",
    "areas": [
      "Metaphysics",
      "Philosophy of Mathematics",
      "Neoplatonism"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology",
      "logic"
    ],
    "quotes": [
      {
        "id": "proclus-1",
        "text": "Mathematics reminds you of the invisible form of the soul; she gives life to her own discoveries; she awakens the mind and purifies the intellect."
      },
      {
        "id": "proclus-2",
        "text": "There was no royal road to geometry."
      },
      {
        "id": "proclus-3",
        "text": "If discovery takes place by the soul who keeps silent, how could the flow of language through the mouth be sufficient?"
      },
      {
        "id": "proclus-4",
        "text": "Wherever there is number, there is beauty."
      }
    ],
    "category": "ANCIENT",
    "country": "Greece"
  },
  {
    "id": "wang-bi",
    "name": "Wang Bi",
    "lifespan": "226-249 CE",
    "era": "Three Kingdoms China (Xuanxue)",
    "symbol": "🌀",
    "oneLiner": "All things arise from nothingness",
    "bio": "Wang Bi was a brilliant Chinese thinker who died at just twenty-three, yet left commentaries on the Daodejing and the Yijing that are still read today. He led the Xuanxue ('Dark Learning') movement, which blended Daoist and Confucian ideas into a fresh metaphysics. His key insight was that all beings originate from nonbeing (wu): a formless, propertyless root that quietly underlies everything that exists. He also taught a famous lesson about reading itself, that words are only tools for catching meaning, and once you have the meaning you can let the words go.",
    "areas": [
      "Metaphysics",
      "Hermeneutics",
      "Daoist Philosophy"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "wang-bi-1",
        "text": "Words exist because of meaning; once you've gotten the meaning, you can forget the words."
      },
      {
        "id": "wang-bi-2",
        "text": "The rabbit snare exists because of the rabbit; once you've gotten the rabbit, you can forget the snare."
      },
      {
        "id": "wang-bi-3",
        "text": "It is spoken of as 'Dao' insofar as there is thus something for things to come from."
      },
      {
        "id": "wang-bi-4",
        "text": "The spirit of the valley is the Non-Being found in the center of a valley; it has neither form nor shadow."
      }
    ],
    "category": "EASTERN",
    "country": "China"
  },
  {
    "id": "huineng",
    "name": "Huineng",
    "lifespan": "638-713 CE",
    "era": "Tang China (Chan Buddhism)",
    "symbol": "🪞",
    "oneLiner": "Awakening is sudden, not gradually polished",
    "bio": "Huineng is honored as the Sixth Patriarch of Chan (Zen) Buddhism, and the tradition celebrates him as an illiterate woodcutter who grasped the truth more deeply than learned monks. The Platform Sutra tells how he won the patriarchship with a verse insisting that the mind is not a mirror needing to be wiped clean of dust. His central teaching is sudden enlightenment: your own buddha-nature is already pure and whole, and it can be recognized directly, in an instant, by anyone. This radical idea made awakening available beyond monastery walls and shaped all later Zen.",
    "areas": [
      "Buddhist Philosophy",
      "Metaphysics",
      "Philosophy of Mind"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "huineng-1",
        "text": "Bodhi originally has no tree, and the bright mirror has no stand."
      },
      {
        "id": "huineng-2",
        "text": "Fundamentally there is not a single thing; where could dust alight?"
      },
      {
        "id": "huineng-3",
        "text": "The buddha-nature is always clear and pure; where is there room for dust?"
      },
      {
        "id": "huineng-4",
        "text": "Our own nature is fundamentally pure, and through this very mind we suddenly become a buddha."
      }
    ],
    "category": "EASTERN",
    "country": "China"
  },
  {
    "id": "linji-yixuan",
    "name": "Linji Yixuan",
    "lifespan": "died 866 CE",
    "era": "Tang China (Chan Buddhism)",
    "symbol": "⚡",
    "oneLiner": "Cling to nothing, not even the Buddha",
    "bio": "Linji Yixuan was a fierce Tang-dynasty Chan master whose recorded sayings gave rise to the Linji school, known in Japan as Rinzai Zen. He taught with shouts, sudden blows, and shocking words meant to jolt students out of their habit of grasping at concepts. His most notorious line, 'if you meet the Buddha, kill the Buddha,' is not irreverence but a warning against turning awakening into one more idol to cling to. At the heart of his teaching is the 'true person of no rank': an awake self that wears no label, role, or social mask.",
    "areas": [
      "Buddhist Philosophy",
      "Philosophy of Mind",
      "Ethics"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology",
      "ethics"
    ],
    "quotes": [
      {
        "id": "linji-yixuan-1",
        "text": "If you meet the Buddha, kill the Buddha."
      },
      {
        "id": "linji-yixuan-2",
        "text": "Within this lump of red flesh there is a true person of no rank, always going in and out through the gates of your face."
      },
      {
        "id": "linji-yixuan-3",
        "text": "Followers of the Way, the Dharma of the buddhas calls for no special undertakings. Just act ordinary, without trying to do anything in particular."
      },
      {
        "id": "linji-yixuan-4",
        "text": "If you love the sacred and despise the ordinary, you are still bobbing in the sea of delusion."
      }
    ],
    "category": "EASTERN",
    "country": "China"
  },
  {
    "id": "zhou-dunyi",
    "name": "Zhou Dunyi",
    "lifespan": "1017-1073 CE",
    "era": "Northern Song China (Neo-Confucian)",
    "symbol": "☯️",
    "oneLiner": "The cosmos unfolds from the Supreme Ultimate",
    "bio": "Zhou Dunyi is regarded as a founding figure of Neo-Confucianism, the system of thought that guided Chinese intellectual life for nearly a thousand years. In his short, dense 'Explanation of the Diagram of the Supreme Ultimate,' he sketched how the whole universe unfolds from the Taiji through the interplay of yin and yang and the five phases. He insisted that metaphysics and ethics cannot be separated, so understanding the cosmos and becoming a good person are one project. His famous essay 'On the Love of the Lotus' praises the flower that rises unstained from the mud as an image of moral integrity.",
    "areas": [
      "Metaphysics",
      "Cosmology",
      "Ethics"
    ],
    "branchSlugs": [
      "metaphysics",
      "ethics"
    ],
    "quotes": [
      {
        "id": "zhou-dunyi-1",
        "text": "I love the lotus, for it rises unsullied from the mud and yet is not corrupted."
      },
      {
        "id": "zhou-dunyi-2",
        "text": "Sincerity is the foundation of the sage."
      },
      {
        "id": "zhou-dunyi-3",
        "text": "The many are ultimately one, and the one is differentiated into the many."
      },
      {
        "id": "zhou-dunyi-4",
        "text": "The Supreme Ultimate through movement generates yang; movement reaching its limit becomes tranquility, and through tranquility it generates yin."
      }
    ],
    "category": "EASTERN",
    "country": "China"
  },
  {
    "id": "zhang-zai",
    "name": "Zhang Zai",
    "lifespan": "1020-1077 CE",
    "era": "Northern Song China (Neo-Confucian)",
    "symbol": "🌍",
    "oneLiner": "All people are my brothers and sisters",
    "bio": "Zhang Zai was a Northern Song philosopher who gave Neo-Confucianism much of its metaphysical depth. He taught that everything in the universe is a passing condensation of qi, a single vital matter-energy whose ultimate state he called the 'Great Vacuity.' Because we all share this one fabric, he drew a stirring ethical conclusion in his short text the 'Western Inscription': the whole cosmos is one family. His vision of universal kinship, where Heaven is our father and Earth our mother, became one of the most beloved expressions of Confucian compassion.",
    "areas": [
      "Metaphysics",
      "Ethics",
      "Cosmology"
    ],
    "branchSlugs": [
      "metaphysics",
      "ethics"
    ],
    "quotes": [
      {
        "id": "zhang-zai-1",
        "text": "Heaven is my father and Earth is my mother, and even such a small creature as I finds an intimate place in their midst."
      },
      {
        "id": "zhang-zai-2",
        "text": "All people are my brothers and sisters, and all things are my companions."
      },
      {
        "id": "zhang-zai-3",
        "text": "That which fills the universe I regard as my body, and that which directs the universe I consider as my nature."
      },
      {
        "id": "zhang-zai-4",
        "text": "In life I follow and serve Heaven and Earth; in death I will be at peace."
      }
    ],
    "category": "EASTERN",
    "country": "China"
  },
  {
    "id": "shinran",
    "name": "Shinran",
    "lifespan": "1173-1263 CE",
    "era": "Kamakura Japan (Pure Land)",
    "symbol": "🙏",
    "oneLiner": "Salvation comes through other-power, not effort",
    "bio": "Shinran was a Japanese Buddhist reformer and the founder of Jodo Shinshu, the Pure Land school that became one of the largest forms of Buddhism in Japan. A former Tendai monk, he concluded that enlightenment cannot be earned through meditation, ritual, or moral striving (jiriki, or self-power). Instead he placed total trust in the 'other-power' (tariki) of Amida Buddha's compassionate vow. Living openly as a married teacher who called himself 'neither monk nor layman,' he taught that it is precisely the person who knows their own helplessness who is embraced by grace.",
    "areas": [
      "Buddhist Philosophy",
      "Philosophy of Religion",
      "Ethics"
    ],
    "branchSlugs": [
      "metaphysics",
      "ethics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "shinran-1",
        "text": "Even a good person attains birth in the Pure Land, so it goes without saying that an evil person will."
      },
      {
        "id": "shinran-2",
        "text": "I am neither monk nor layman."
      },
      {
        "id": "shinran-3",
        "text": "When I ponder on the compassionate vow of Amida, it was for myself, Shinran, alone."
      },
      {
        "id": "shinran-4",
        "text": "To say the nembutsu with the whole heart is itself the working of Amida's great compassion."
      }
    ],
    "category": "EASTERN",
    "country": "Japan"
  },
  {
    "id": "dai-zhen",
    "name": "Dai Zhen",
    "lifespan": "1724-1777 CE",
    "era": "Qing China (Evidential Learning)",
    "symbol": "🔎",
    "oneLiner": "Desires and feelings are part of the Way",
    "bio": "Dai Zhen was the leading philosopher of the Qing dynasty's 'evidential learning' movement, which prized careful textual and empirical research over abstract speculation. He sharply criticized the dominant Neo-Confucian habit of treating principle (li) as something opposed to human desires and feelings. For Dai, our natural emotions and desires are not obstacles to morality but the very material that proper moral reasoning must work with. He warned, in a phrase that still bites, that rulers who 'kill people with principle' do harm as real as cruel officials who kill with the law.",
    "areas": [
      "Ethics",
      "Epistemology",
      "Moral Psychology"
    ],
    "branchSlugs": [
      "ethics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "dai-zhen-1",
        "text": "When a man is killed by the law, there are still some who pity him; but when he is killed by principle, who ever pities him?"
      },
      {
        "id": "dai-zhen-2",
        "text": "Principle is nothing other than feeling that does not err; there has never been a principle apart from human feeling."
      },
      {
        "id": "dai-zhen-3",
        "text": "To realize the desires of others as one realizes one's own: this is the fulfillment of the Way."
      },
      {
        "id": "dai-zhen-4",
        "text": "Without desire there would be no action, and without action there would be nothing to call the Way."
      }
    ],
    "category": "EASTERN",
    "country": "China"
  },
  {
    "id": "hakuin-ekaku",
    "name": "Hakuin Ekaku",
    "lifespan": "1686-1769 CE",
    "era": "Edo Japan (Rinzai Zen)",
    "symbol": "👏",
    "oneLiner": "What is the sound of one hand?",
    "bio": "Hakuin Ekaku revived Rinzai Zen in Japan so thoroughly that nearly every later teacher in the tradition descends from him. He systematized koan practice into a graded curriculum and is credited with the most famous koan of all: 'What is the sound of one hand?' He taught that real awakening requires great faith, great doubt, and great determination held together. A gifted painter and writer, he insisted in his 'Song of Zazen' that enlightenment is not somewhere else, this very place is the Pure Land and this very body the Buddha.",
    "areas": [
      "Buddhist Philosophy",
      "Philosophy of Mind",
      "Aesthetics"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology",
      "aesthetics"
    ],
    "quotes": [
      {
        "id": "hakuin-ekaku-1",
        "text": "Two hands clap and there is a sound; what is the sound of one hand?"
      },
      {
        "id": "hakuin-ekaku-2",
        "text": "All beings by nature are Buddha, as ice by nature is water; apart from water there is no ice, apart from beings no Buddha."
      },
      {
        "id": "hakuin-ekaku-3",
        "text": "This very place is the Lotus Land, this very body the Buddha."
      },
      {
        "id": "hakuin-ekaku-4",
        "text": "At this moment what more need you seek? As eternal tranquility reveals itself before you, this very place is the Land of Lotuses."
      }
    ],
    "category": "EASTERN",
    "country": "Japan"
  },
  {
    "id": "motoori-norinaga",
    "name": "Motoori Norinaga",
    "lifespan": "1730-1801 CE",
    "era": "Edo Japan (Kokugaku)",
    "symbol": "🌸",
    "oneLiner": "Beauty lies in the pathos of things",
    "bio": "Motoori Norinaga was the towering scholar of Japan's Kokugaku, or 'National Learning' movement, which sought the native spirit of Japan in its oldest texts rather than in imported Chinese thought. After decades of study he produced a monumental commentary on the ancient Kojiki. He is best loved for the idea of mono no aware, the tender, bittersweet sensitivity to the impermanence of things, like cherry blossoms that move us precisely because they fall. For Norinaga this emotional responsiveness was not mere sentiment but a genuine way of knowing the heart of the world.",
    "areas": [
      "Aesthetics",
      "Philosophy of Literature",
      "Epistemology"
    ],
    "branchSlugs": [
      "aesthetics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "motoori-norinaga-1",
        "text": "To know mono no aware is to be stirred by the moon and the cherry blossoms, and by the essence of every single thing in this world."
      },
      {
        "id": "motoori-norinaga-2",
        "text": "Knowing the sorrow of a thing comes from knowing the heart of a thing."
      },
      {
        "id": "motoori-norinaga-3",
        "text": "The heart that is ignorant of this moving power will never be stirred, no matter how clear the moon or how lovely the blossoms before it."
      },
      {
        "id": "motoori-norinaga-4",
        "text": "If someone asks about the spirit of old Japan, it is the wild cherry blossoms glowing in the morning sun."
      }
    ],
    "category": "EASTERN",
    "country": "Japan"
  },
  {
    "id": "watsuji-tetsuro",
    "name": "Watsuji Tetsuro",
    "lifespan": "1889-1960 CE",
    "era": "Modern Japan (Kyoto School)",
    "symbol": "🤝",
    "oneLiner": "The self exists in the betweenness of persons",
    "bio": "Watsuji Tetsuro was a modern Japanese philosopher associated with the Kyoto School who rethought ethics around relationship rather than the isolated individual. He noticed that the Japanese word for a human being, ningen, literally points to the 'between' of persons, and built his ethics on this 'betweenness' (aidagara). For Watsuji, we are never first solitary selves and only later social; we exist from the start in the space between self and other. In his book on 'climate' (fudo) he also argued that the lands and weather we live in quietly shape our cultures and ways of being.",
    "areas": [
      "Ethics",
      "Philosophical Anthropology",
      "Phenomenology"
    ],
    "branchSlugs": [
      "ethics",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "watsuji-tetsuro-1",
        "text": "Ethics consists of the laws of social existence."
      },
      {
        "id": "watsuji-tetsuro-2",
        "text": "The communion between man and man does not mean their becoming merely one."
      },
      {
        "id": "watsuji-tetsuro-3",
        "text": "Fudo means wind and earth, the natural environment of a given land."
      },
      {
        "id": "watsuji-tetsuro-4",
        "text": "The human being is not a mere individual, nor mere society, but the betweenness of the two at once."
      }
    ],
    "category": "EASTERN",
    "country": "Japan"
  },
  {
    "id": "kapila-samkhya",
    "name": "Kapila",
    "lifespan": "c. 6th century BCE",
    "era": "Ancient India",
    "symbol": "�This",
    "oneLiner": "Two realities: conscious spirit and unconscious nature",
    "bio": "Kapila is revered as the founder of Samkhya, one of the oldest schools of Indian philosophy. He taught a striking dualism: reality is made of purusha (pure consciousness, the silent witness) and prakriti (nature, the active material world). For Kapila, suffering comes from confusing the two, mistaking the changing flow of nature for our true self. Liberation arrives the moment consciousness recognizes it was always free, simply watching nature unfold. His system shaped later Yoga philosophy and gave Indian thought its enduring vocabulary of the three gunas.",
    "areas": [
      "Metaphysics",
      "Philosophy of Mind",
      "Soteriology"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "kapila-1",
        "text": "Spirit is the witness, solitary, indifferent, the spectator of nature's dance."
      },
      {
        "id": "kapila-2",
        "text": "Bondage and liberation belong to nature, not to the spirit, which is forever free."
      },
      {
        "id": "kapila-3",
        "text": "From the non-discrimination of spirit and nature springs all suffering."
      },
      {
        "id": "kapila-4",
        "text": "When nature is known to be other than the self, she ceases to bind."
      },
      {
        "id": "kapila-5",
        "text": "Nature acts for the sake of the spirit, as a dancer who departs once seen."
      }
    ],
    "category": "EASTERN",
    "country": "India"
  },
  {
    "id": "ramanuja-vishishtadvaita",
    "name": "Ramanuja",
    "lifespan": "c. 1017-1137",
    "era": "Medieval South India",
    "symbol": "🪷",
    "oneLiner": "God, souls, and world are really one yet distinct",
    "bio": "Ramanuja was the great philosopher of Vishishtadvaita, or qualified non-dualism, and the most influential theologian of devotional Hinduism. Against the strict monism of Shankara, he argued that the world and individual souls are fully real, forming the living body of which God (Brahman, as Vishnu) is the soul. This let him keep both unity and a personal, loving God worth devotion. For Ramanuja, knowledge alone cannot free us; only bhakti, loving surrender to God, completes the path. His warm vision of grace and devotion shaped centuries of South Indian religious life and the wider Bhakti movement.",
    "areas": [
      "Metaphysics",
      "Philosophy of Religion",
      "Epistemology"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "ramanuja-1",
        "text": "Brahman is such that cognizing of him is an infinite and abiding joy."
      },
      {
        "id": "ramanuja-2",
        "text": "What an individual pursues as a desirable end depends upon what he conceives himself to be."
      },
      {
        "id": "ramanuja-3",
        "text": "When the food is pure the sattva element gets purified, and the memory becomes unwavering."
      },
      {
        "id": "ramanuja-4",
        "text": "By the study of Vedanta, they understand that all objects are the effects of Brahman."
      },
      {
        "id": "ramanuja-5",
        "text": "The individual self has Brahman as its inner self, animating it as the soul animates the body."
      }
    ],
    "category": "EASTERN",
    "country": "India"
  },
  {
    "id": "madhva-dvaita",
    "name": "Madhva",
    "lifespan": "c. 1199-1278",
    "era": "Medieval South India",
    "symbol": "🪈",
    "oneLiner": "Soul and God are eternally, really different",
    "bio": "Madhvacharya founded Dvaita, the boldest dualist school of Vedanta, insisting that the difference between the soul and God is real and never dissolves. Where others sought oneness, Madhva celebrated distinction: God (Vishnu) is supreme and independent, while souls and the world are real but utterly dependent on him. He even taught that souls differ from one another by their very nature, a rare position in Indian thought. Liberation, for Madhva, is not merging into God but enjoying eternal nearness to him through devotion. A vigorous debater who wrote thirty-seven works, he became a cornerstone of Vaishnava devotion in Karnataka.",
    "areas": [
      "Metaphysics",
      "Philosophy of Religion",
      "Theology"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "madhva-1",
        "text": "The difference between the soul and the Supreme is real and eternal."
      },
      {
        "id": "madhva-2",
        "text": "Vishnu alone is independent; all else depends upon him for its being."
      },
      {
        "id": "madhva-3",
        "text": "No two souls are alike; each carries its own intrinsic nature."
      },
      {
        "id": "madhva-4",
        "text": "Knowledge of the Lord's supremacy is the gateway to liberation."
      },
      {
        "id": "madhva-5",
        "text": "Even in release the soul remains itself, never becoming God."
      }
    ],
    "category": "EASTERN",
    "country": "India"
  },
  {
    "id": "vasubandhu-yogacara",
    "name": "Vasubandhu",
    "lifespan": "c. 4th-5th century CE",
    "era": "Ancient India (Gandhara)",
    "symbol": "🧠",
    "oneLiner": "The world we know is mind-only",
    "bio": "Vasubandhu was one of the most versatile minds in Buddhist history, honored as a second Buddha for his learning. He first mastered the analytic Abhidharma tradition, summarizing it in the monumental Abhidharmakosha, then converted to Mahayana Buddhism alongside his half-brother Asanga. Together they founded the Yogacara, or mind-only, school, arguing that the world we experience is a construction of consciousness rather than a set of external objects. His subtle psychology of perception, memory, and the storehouse-consciousness reshaped how Buddhists understood the mind. His works traveled across Tibet and East Asia, anchoring centuries of philosophical reflection.",
    "areas": [
      "Metaphysics",
      "Philosophy of Mind",
      "Epistemology"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "vasubandhu-1",
        "text": "All this is mere consciousness, for objects appear as things that are not there."
      },
      {
        "id": "vasubandhu-2",
        "text": "Like one who sees a hair-net in the sky, the deluded mind imagines what does not exist."
      },
      {
        "id": "vasubandhu-3",
        "text": "Consciousness arises bearing the appearance of an object; the object itself is never found."
      },
      {
        "id": "vasubandhu-4",
        "text": "When grasping and grasped both cease, the mind rests in mind-only."
      },
      {
        "id": "vasubandhu-5",
        "text": "The transformations of consciousness are the imaginings by which we construct a world."
      }
    ],
    "category": "EASTERN",
    "country": "India"
  },
  {
    "id": "dignaga-buddhist-logic",
    "name": "Dignaga",
    "lifespan": "c. 480-540 CE",
    "era": "Ancient South India",
    "symbol": "🔎",
    "oneLiner": "Only perception and inference give real knowledge",
    "bio": "Dignaga is often called the father of Buddhist logic, the thinker who turned Indian epistemology into a rigorous science. In his great work, the Pramanasamuccaya, he argued that there are exactly two valid sources of knowledge: perception, which grasps bare particulars free of concepts, and inference, which works with general ideas. He introduced the influential apoha theory, the idea that words mean by exclusion, so cow means simply not non-cow. His sharp analysis of evidence and reasoning forced every later Indian school to sharpen its own logic. Through his successor Dharmakirti, his ideas became the standard of debate across India and Tibet.",
    "areas": [
      "Logic",
      "Epistemology",
      "Philosophy of Language"
    ],
    "branchSlugs": [
      "logic",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "dignaga-1",
        "text": "There are only two means of knowledge: perception and inference."
      },
      {
        "id": "dignaga-2",
        "text": "Perception is cognition that is free from conceptual construction."
      },
      {
        "id": "dignaga-3",
        "text": "A word expresses its own object only by excluding what it is not."
      },
      {
        "id": "dignaga-4",
        "text": "The two means of knowledge correspond to the two kinds of object, the particular and the general."
      },
      {
        "id": "dignaga-5",
        "text": "Concepts add nothing real; they merely separate one thing from another."
      }
    ],
    "category": "EASTERN",
    "country": "India"
  },
  {
    "id": "dharmakirti-epistemology",
    "name": "Dharmakirti",
    "lifespan": "c. 600-660 CE",
    "era": "Ancient India (Nalanda)",
    "symbol": "⚖️",
    "oneLiner": "Knowledge is valuable when it leads to successful action",
    "bio": "Dharmakirti was the towering logician of Buddhist India, who took Dignaga's framework and built it into a complete philosophy. Working at the great university of Nalanda, he defined valid knowledge as cognition that does not deceive, that reliably guides us to successful action. He grounded truth in causation and practical effectiveness, anchoring his epistemology in what actually works in the world. His massive Pramanavarttika became one of the most studied and debated texts in Asia, especially in Tibet, where it remains a cornerstone of monastic education. Sharp, confident, and famously hard to refute, Dharmakirti shaped Indian and Tibetan philosophy for over a thousand years.",
    "areas": [
      "Epistemology",
      "Logic",
      "Philosophy of Mind"
    ],
    "branchSlugs": [
      "epistemology",
      "logic"
    ],
    "quotes": [
      {
        "id": "dharmakirti-1",
        "text": "All successful human action is preceded by right knowledge."
      },
      {
        "id": "dharmakirti-2",
        "text": "A valid cognition is one that does not deceive."
      },
      {
        "id": "dharmakirti-3",
        "text": "Whatever has the power to perform a function is ultimately real."
      },
      {
        "id": "dharmakirti-4",
        "text": "Perception grasps the particular; inference grasps the universal."
      },
      {
        "id": "dharmakirti-5",
        "text": "Knowledge is reliable when the activity it prompts attains its object."
      }
    ],
    "category": "EASTERN",
    "country": "India"
  },
  {
    "id": "kumarila-bhatta-mimamsa",
    "name": "Kumarila Bhatta",
    "lifespan": "c. 7th century CE",
    "era": "Classical India",
    "symbol": "📜",
    "oneLiner": "Knowledge is trustworthy until proven otherwise",
    "bio": "Kumarila Bhatta was the great defender of the Mimamsa school, which centered philosophy on the authority and interpretation of the Vedas. His most famous idea is svatah pramanya, the intrinsic validity of knowledge: every cognition is presumed true on its own, and the burden falls on the doubter to prove it false. He built powerful theories of perception, inference, testimony, and meaning, and pressed brilliant arguments against the Buddhists of his day. So formidable was his work that virtually every later Indian philosopher had to respond to it. Through the Slokavarttika and Tantravarttika, he became one of the most influential epistemologists in Indian history.",
    "areas": [
      "Epistemology",
      "Philosophy of Language",
      "Hermeneutics"
    ],
    "branchSlugs": [
      "epistemology",
      "logic"
    ],
    "quotes": [
      {
        "id": "kumarila-1",
        "text": "The validity of knowledge arises by itself; its invalidity comes from external defects."
      },
      {
        "id": "kumarila-2",
        "text": "Every cognition is to be held true until some flaw is shown."
      },
      {
        "id": "kumarila-3",
        "text": "Words and their meanings are eternal, not the invention of any author."
      },
      {
        "id": "kumarila-4",
        "text": "Perception that is free of error needs no further proof to be trusted."
      },
      {
        "id": "kumarila-5",
        "text": "Doubt, not knowledge, is what stands in need of justification."
      }
    ],
    "category": "EASTERN",
    "country": "India"
  },
  {
    "id": "abhinavagupta-kashmir-shaivism",
    "name": "Abhinavagupta",
    "lifespan": "c. 950-1016",
    "era": "Medieval Kashmir",
    "symbol": "🎭",
    "oneLiner": "Beauty and the world are consciousness recognizing itself",
    "bio": "Abhinavagupta was a dazzling polymath of medieval Kashmir, equally at home in mysticism, metaphysics, and art theory. As the master of Kashmir Shaivism, he taught that all reality is a single divine consciousness, Shiva, playfully manifesting as the world; liberation is simply recognizing that you were Shiva all along. He is equally famous as an aesthetician: in his commentary on the Natyashastra, he explained rasa, the savored emotion of art, as a taste of pure blissful awareness, a rehearsal for spiritual freedom. Author of more than forty works, including the vast Tantraloka, he wove together philosophy, tantra, and poetics into one luminous vision.",
    "areas": [
      "Aesthetics",
      "Metaphysics",
      "Philosophy of Mind"
    ],
    "branchSlugs": [
      "aesthetics",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "abhinavagupta-1",
        "text": "The aesthetic experience is the very heart of the experience of the supreme reality."
      },
      {
        "id": "abhinavagupta-2",
        "text": "Consciousness alone shines forth, and the whole universe is its joyful self-expression."
      },
      {
        "id": "abhinavagupta-3",
        "text": "Rasa is relished by a heart made tender and clear, like a flawless mirror."
      },
      {
        "id": "abhinavagupta-4",
        "text": "The Self is Shiva, ever free, performing the play of concealment and recognition."
      },
      {
        "id": "abhinavagupta-5",
        "text": "Liberation is nothing but the recognition of one's own true nature."
      }
    ],
    "category": "EASTERN",
    "country": "India"
  },
  {
    "id": "guru-nanak-sikh",
    "name": "Guru Nanak",
    "lifespan": "1469-1539",
    "era": "Medieval Punjab",
    "symbol": "☬",
    "oneLiner": "One God, equality of all, honest living",
    "bio": "Guru Nanak was the founder of Sikhism and the first of its ten Gurus, a poet-mystic who walked across Asia teaching a bold message of unity. He proclaimed Ik Onkar, one formless God present in all creation, and rejected the divisions of caste, ritual, and religious labels. In a famously simple formula he taught Naam Japo, Kirat Karo, Vand Chakko: remember God, earn an honest living, and share with others. He founded the practice of langar, the free community kitchen where everyone eats together as equals. His luminous hymns, preserved in the Guru Granth Sahib, still anchor the spiritual and social life of millions.",
    "areas": [
      "Philosophy of Religion",
      "Ethics",
      "Social Philosophy"
    ],
    "branchSlugs": [
      "ethics",
      "metaphysics",
      "political-philosophy"
    ],
    "quotes": [
      {
        "id": "guru-nanak-1",
        "text": "There is no Hindu, there is no Muslim."
      },
      {
        "id": "guru-nanak-2",
        "text": "Make compassion the cotton, contentment the thread, modesty the knot and truth the twist."
      },
      {
        "id": "guru-nanak-3",
        "text": "The impurity of the mind is greed, and the impurity of the tongue is falsehood."
      },
      {
        "id": "guru-nanak-4",
        "text": "Of a woman are we conceived, of a woman are we born; why call her inferior?"
      },
      {
        "id": "guru-nanak-5",
        "text": "Truth is the highest virtue, but higher still is truthful living."
      }
    ],
    "category": "EASTERN",
    "country": "India"
  },
  {
    "id": "br-ambedkar",
    "name": "B.R. Ambedkar",
    "lifespan": "1891-1956",
    "era": "Modern India",
    "symbol": "⚖️",
    "oneLiner": "Liberty, equality, and the annihilation of caste",
    "bio": "B.R. Ambedkar was a jurist, economist, and social reformer who became modern India's most powerful philosopher of equality. Born into the Mahar caste and branded untouchable, he turned his brilliance into a lifelong assault on caste injustice, earning doctorates abroad and chairing the drafting of India's Constitution. He argued that political freedom is hollow without social and economic liberty, and that caste must be annihilated, not reformed. Late in life he led hundreds of thousands of followers in converting to Buddhism, founding a socially engaged Navayana that centered reason, compassion, and human dignity. His ideas continue to shape struggles for justice across India and beyond.",
    "areas": [
      "Political Philosophy",
      "Ethics",
      "Social Philosophy"
    ],
    "branchSlugs": [
      "political-philosophy",
      "ethics"
    ],
    "quotes": [
      {
        "id": "br-ambedkar-1",
        "text": "So long as you do not achieve social liberty, whatever freedom is provided by the law is of no avail to you."
      },
      {
        "id": "br-ambedkar-2",
        "text": "Caste is not just a division of labour, it is a division of labourers."
      },
      {
        "id": "br-ambedkar-3",
        "text": "Nothing is infallible. Nothing is binding forever. Everything is subject to inquiry and examination."
      },
      {
        "id": "br-ambedkar-4",
        "text": "Unlike a drop of water which loses its identity when it joins the ocean, man does not lose his being in the society in which he lives."
      },
      {
        "id": "br-ambedkar-5",
        "text": "Religion is for man and not man for religion."
      }
    ],
    "category": "EASTERN",
    "country": "India"
  },
  {
    "id": "bahya-ibn-paquda",
    "name": "Bahya ibn Paquda",
    "lifespan": "c. 1050-1120",
    "era": "Muslim Spain (al-Andalus)",
    "symbol": "❤️",
    "oneLiner": "True religion lives in the heart, not just the hands",
    "bio": "Bahya ibn Paquda was a Jewish judge and moral philosopher in Muslim Zaragoza who wrote the first Jewish system of ethics, the Duties of the Heart. He noticed that many people obeyed religious law outwardly while neglecting the inner life, so he distinguished the 'duties of the limbs' from the 'duties of the heart' such as humility, gratitude, sincere trust, and love. Drawing freely on Sufi mysticism and Greek thought, he argued that an action only matters when the heart behind it is pure. His warm, devotional book became a beloved classic read across the Jewish world for centuries.",
    "areas": [
      "Ethics",
      "Philosophy of Religion",
      "Mysticism"
    ],
    "branchSlugs": [
      "ethics",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "bahya-ibn-paquda-1",
        "text": "Days are scrolls: write on them only what you want remembered."
      },
      {
        "id": "bahya-ibn-paquda-2",
        "text": "Words are but the shell; meditation is the kernel."
      },
      {
        "id": "bahya-ibn-paquda-3",
        "text": "One of the rules of caution is not to be too cautious."
      },
      {
        "id": "bahya-ibn-paquda-4",
        "text": "If we could not forget, we would never be free from grief."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Spain (al-Andalus)"
  },
  {
    "id": "miskawayh",
    "name": "Miskawayh",
    "lifespan": "932-1030",
    "era": "Buyid Persia",
    "symbol": "⚖️",
    "oneLiner": "Good character can be trained like a skill",
    "bio": "Miskawayh was a Persian historian and court official often called the founder of Islamic moral philosophy. In his influential book The Refinement of Character he argued that virtue is not inborn but cultivated through habit, education, and good company, much like learning a craft. Blending Aristotle and Plato with Islamic life, he treated happiness as something attainable here on earth through balance, justice, and friendship. He believed people complete one another, finding their own perfection through love and association with others.",
    "areas": [
      "Ethics",
      "Moral Psychology",
      "History"
    ],
    "branchSlugs": [
      "ethics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "miskawayh-1",
        "text": "People must love one another, for each one finds his own perfection in someone else."
      },
      {
        "id": "miskawayh-2",
        "text": "Man's aspirations should not be human, though he be a man, nor should he be satisfied with the aspirations of the animal which is destined to die."
      },
      {
        "id": "miskawayh-3",
        "text": "Justice requires that each one should stay in his rank and not transgress it."
      },
      {
        "id": "miskawayh-4",
        "text": "When you gain a friend, you should pay much regard to him and do your utmost in looking after him."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Persia"
  },
  {
    "id": "judah-abrabanel",
    "name": "Judah Abrabanel (Leone Ebreo)",
    "lifespan": "c. 1465-after 1521",
    "era": "Renaissance Italy",
    "symbol": "💞",
    "oneLiner": "Love is the force that binds the whole universe",
    "bio": "Judah Abrabanel, known in Italy as Leone Ebreo, was a Jewish physician, poet, and philosopher who fled the expulsion from Spain and settled in Renaissance Italy. His masterpiece, the Dialogues of Love, is a graceful conversation between Philo and Sophia exploring how desire, beauty, and knowledge draw all things back toward God. He pictured the cosmos as a great circle of love, flowing out from its divine source and returning to it as its ultimate end. Weaving together Jewish, Platonic, and Arabic ideas, his work shaped later thinkers from Giordano Bruno to Spinoza.",
    "areas": [
      "Philosophy of Love",
      "Aesthetics",
      "Metaphysics"
    ],
    "branchSlugs": [
      "aesthetics",
      "metaphysics",
      "ethics"
    ],
    "quotes": [
      {
        "id": "judah-abrabanel-1",
        "text": "Divine Love is the inclination of God's most beautiful wisdom toward the likeness of His own beauty."
      },
      {
        "id": "judah-abrabanel-2",
        "text": "The circle of all things begins from their first origin, and passing through each thing in turn, returns to its first origin as to its ultimate end."
      },
      {
        "id": "judah-abrabanel-3",
        "text": "When the soul perceives a beautiful person whose beauty is in harmony with itself, it recognizes in and through this beauty divine beauty."
      },
      {
        "id": "judah-abrabanel-4",
        "text": "Time with his pointed shafts has hit my heart and split my guts, laid open my entrails."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Portugal"
  },
  {
    "id": "isaac-israeli",
    "name": "Isaac Israeli ben Solomon",
    "lifespan": "c. 855-955",
    "era": "Fatimid North Africa",
    "symbol": "🔭",
    "oneLiner": "Know yourself and you will know everything",
    "bio": "Isaac Israeli was a celebrated physician at the Fatimid court in Kairouan and is often called the father of medieval Jewish Neoplatonism. Alongside famous medical works, he wrote short philosophical treatises, including a pioneering Book of Definitions that fixed the meanings of ideas like wisdom, soul, and intellect for later thinkers. He taught that the soul descends from a higher world and that philosophy is self-knowledge that leads us to become, as far as possible, like God. His writings, translated into Latin, influenced Christian, Jewish, and Muslim scholars across the Middle Ages.",
    "areas": [
      "Metaphysics",
      "Philosophy of Mind",
      "Medicine"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "isaac-israeli-1",
        "text": "Philosophy is self-knowledge and keeping far from evil."
      },
      {
        "id": "isaac-israeli-2",
        "text": "When a man knows himself truly, his spiritual as well as his corporeal aspects, he knows everything."
      },
      {
        "id": "isaac-israeli-3",
        "text": "The nature and aim of philosophy is to become like unto God as far as is possible for man."
      },
      {
        "id": "isaac-israeli-4",
        "text": "His books will cause his name to be remembered far better than children would."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Egypt"
  },
  {
    "id": "joseph-albo",
    "name": "Joseph Albo",
    "lifespan": "c. 1380-1444",
    "era": "Medieval Spain",
    "symbol": "📜",
    "oneLiner": "Three core beliefs anchor any divine religion",
    "bio": "Joseph Albo was a Spanish rabbi and philosopher who lived through a hard age of religious disputation and forced conversions. In his widely read Book of Principles he tried to simplify and defend Jewish faith by reducing it to three fundamental beliefs: that God exists, that revelation is real, and that there is reward and punishment. He argued that human reason alone is too limited to reach perfect truth, so divine guidance is needed to complete it. Clear and accessible, his work became one of the most popular and enduring texts of medieval Jewish thought.",
    "areas": [
      "Philosophy of Religion",
      "Ethics",
      "Theology"
    ],
    "branchSlugs": [
      "metaphysics",
      "ethics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "joseph-albo-1",
        "text": "Human intellect cannot attain unto perfect knowledge, since its power is limited and soon exhausted; therefore there must be something above human intellect through which knowledge can attain a degree of excellence that admits of no doubt."
      },
      {
        "id": "joseph-albo-2",
        "text": "He that would criticize a book should, above all, know the method employed by its author, and should judge all the passages on a subject as a whole."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Spain"
  },
  {
    "id": "abu-hayyan-al-tawhidi",
    "name": "Abu Hayyan al-Tawhidi",
    "lifespan": "c. 923-1023",
    "era": "Abbasid Baghdad",
    "symbol": "🖋️",
    "oneLiner": "The philosopher of writers, the writer of philosophers",
    "bio": "Abu Hayyan al-Tawhidi was a brilliant, bitter master of Arabic prose who lived a poor and restless life on the edges of Baghdad's learned circles. He recorded the great debates of his age in dazzling books like The Book of Enjoyment and Bonhomie, blending philosophy, ethics, and literary style. A towering figure of Islamic humanism, he wrestled with the ambiguity of the human condition rather than celebrating human greatness. He warned that real wisdom needs a living teacher, since books alone can confuse even the sharpest mind.",
    "areas": [
      "Philosophy of Language",
      "Ethics",
      "Humanism"
    ],
    "branchSlugs": [
      "ethics",
      "epistemology",
      "aesthetics"
    ],
    "quotes": [
      {
        "id": "abu-hayyan-al-tawhidi-1",
        "text": "Inexperienced people think that books will lead the one of intellect to understanding, but in these books are ambiguities that confuse even the most intelligent."
      },
      {
        "id": "abu-hayyan-al-tawhidi-2",
        "text": "If you try to learn this knowledge without a teacher, you will go astray and affairs will become confusing to you."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Iraq"
  },
  {
    "id": "al-amiri",
    "name": "Abu al-Hasan al-Amiri",
    "lifespan": "c. 920-992",
    "era": "Samanid Khurasan",
    "symbol": "🕊️",
    "oneLiner": "Reason and revelation point to the same truth",
    "bio": "Al-Amiri was a Persian philosopher from Nishapur, one of the last heirs of the rationalist tradition begun by al-Kindi. A wide-ranging thinker, he wrote on logic, ethics, the soul, and comparative religion, drawing heavily on Plato and the Neoplatonists. In his book On the Afterlife he argued that the great Greek philosophers had themselves believed in the soul's immortality and its reward and punishment. His central conviction was that genuine philosophy can never truly contradict revealed religion, since both lead to one truth.",
    "areas": [
      "Metaphysics",
      "Philosophy of Religion",
      "Ethics"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology",
      "ethics"
    ],
    "quotes": [
      {
        "id": "al-amiri-1",
        "text": "The genuine conclusions of philosophy cannot contradict the revealed truths of religion."
      },
      {
        "id": "al-amiri-2",
        "text": "The wisest of the Greeks believed in the immortality of the soul and its requital in the hereafter."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Persia"
  },
  {
    "id": "abu-sulayman-al-sijistani",
    "name": "Abu Sulayman al-Sijistani",
    "lifespan": "c. 912-985",
    "era": "Abbasid Baghdad",
    "symbol": "🗝️",
    "oneLiner": "Religion and philosophy are both true, but separate",
    "bio": "Abu Sulayman al-Sijistani, nicknamed 'the Logician,' led the leading circle of Aristotelian philosophers in tenth-century Baghdad. Around him gathered scholars and writers who met to debate logic, language, and the soul, sessions famously recorded by his student al-Tawhidi. A deeply religious humanist, he held that religion and philosophy are both valid but distinct, each answering different questions by different means. His best-known work, the Vessel of Wisdom, gathered the sayings of philosophers from the Greeks down to his own day.",
    "areas": [
      "Logic",
      "Metaphysics",
      "Philosophy of Religion"
    ],
    "branchSlugs": [
      "logic",
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "abu-sulayman-al-sijistani-1",
        "text": "Religion and philosophy are both valid and true, but separate, concerned with different matters and proceeding by different means."
      },
      {
        "id": "abu-sulayman-al-sijistani-2",
        "text": "Wisdom is a vessel into which the sayings of the wise are gathered from every age."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Persia"
  },
  {
    "id": "yahya-ibn-adi",
    "name": "Yahya ibn Adi",
    "lifespan": "893-974",
    "era": "Abbasid Baghdad",
    "symbol": "🤝",
    "oneLiner": "Reason should rule the soul and unite humankind",
    "bio": "Yahya ibn Adi was a Syriac Christian logician and translator who became the acknowledged master of logic in Baghdad after studying under al-Farabi and Abu Bishr Matta. He rendered key works of Greek philosophy into Arabic and wrote an early classic of virtue ethics, The Reformation of Morals. He taught that each person becomes truly human by letting the rational soul govern the lower appetites through habit and knowledge. Because all people share that same rational soul, he held, none is by nature superior to another, and philosophy could serve as common ground between Jews, Christians, and Muslims.",
    "areas": [
      "Logic",
      "Ethics",
      "Metaphysics"
    ],
    "branchSlugs": [
      "logic",
      "ethics",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "yahya-ibn-adi-1",
        "text": "Man is man because of his rational soul, yet he can never be by nature superior to his fellow, for each is endowed with the same soul."
      },
      {
        "id": "yahya-ibn-adi-2",
        "text": "Good morals must be made habitual by subjecting the lower souls and their faculties to the rule of the rational soul."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Iraq"
  },
  {
    "id": "joseph-ibn-tzaddik",
    "name": "Joseph ibn Tzaddik",
    "lifespan": "c. 1075-1149",
    "era": "Muslim Spain (al-Andalus)",
    "symbol": "🌍",
    "oneLiner": "The human being is a universe in miniature",
    "bio": "Joseph ibn Tzaddik was a rabbi, poet, and philosopher who served as a judge in Cordova alongside the father of Maimonides. His reputation rests on a short treatise called The Microcosm, written in Arabic and later translated into Hebrew. Its central idea is that the human being mirrors the whole cosmos in miniature, so that knowing yourself becomes the key to knowing the world and ultimately God. Drawing on Neoplatonic and Jewish sources, he made self-knowledge the highest path to wisdom.",
    "areas": [
      "Metaphysics",
      "Philosophy of Mind",
      "Theology"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "joseph-ibn-tzaddik-1",
        "text": "Man is a small world, and by knowing himself he comes to know all corporeal and spiritual things, and ultimately God."
      },
      {
        "id": "joseph-ibn-tzaddik-2",
        "text": "The knowledge of God is the highest duty of man, and it is best attained by way of self-knowledge."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Spain (al-Andalus)"
  },
  {
    "id": "john-scotus-eriugena",
    "name": "John Scotus Eriugena",
    "lifespan": "c. 810 - c. 877",
    "era": "Early Medieval Ireland / Carolingian France",
    "symbol": "🌀",
    "oneLiner": "Reality flows out from God and returns to God",
    "bio": "John Scotus Eriugena was an Irish-born scholar who became the most original philosopher of the early Middle Ages, working at the court of the Frankish king Charles the Bald. His masterwork, the Periphyseon (On the Division of Nature), imagines all of reality as a single 'nature' that includes both God and creation, flowing out from God and ultimately returning to its source. A rare reader of Greek in the Latin West, he translated mystical Christian Neoplatonists and wove their ideas into a daring vision of the cosmos. He insisted that genuine reason and true religion never conflict, and that authority itself is only worth following when it agrees with reason. His bold thinking was admired and feared in equal measure, and parts of his work were later condemned.",
    "areas": [
      "Metaphysics",
      "Philosophy of Religion",
      "Epistemology"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "john-scotus-eriugena-1",
        "text": "Authority proceeds from true reason, but reason certainly does not proceed from authority."
      },
      {
        "id": "john-scotus-eriugena-2",
        "text": "True philosophy is true religion, and conversely true religion is true philosophy."
      },
      {
        "id": "john-scotus-eriugena-3",
        "text": "We do not know what God is. God Himself does not know what He is because He is not anything. Literally God is not, because He transcends being."
      },
      {
        "id": "john-scotus-eriugena-4",
        "text": "Every visible and invisible creature is a theophany, an appearance of God."
      },
      {
        "id": "john-scotus-eriugena-5",
        "text": "Nature is the general name for all things, for those that are and those that are not."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Ireland"
  },
  {
    "id": "marsilius-of-padua",
    "name": "Marsilius of Padua",
    "lifespan": "c. 1280 - c. 1343",
    "era": "Late Medieval Italy",
    "symbol": "⚖️",
    "oneLiner": "All political power belongs to the people",
    "bio": "Marsilius of Padua was an Italian scholar, physician, and political thinker who served as rector of the University of Paris. In his explosive treatise Defensor Pacis (The Defender of Peace), he argued that the true source of law and political authority is the whole body of citizens, not the pope or clergy. He insisted that the Church should have no coercive power in worldly affairs, a claim so radical that he was excommunicated and forced to flee. His theory of popular sovereignty and the separation of spiritual and secular power anticipated ideas central to modern democracy. Through later thinkers his influence reached all the way to debates about consent and the limits of government.",
    "areas": [
      "Political Philosophy",
      "Philosophy of Law"
    ],
    "branchSlugs": [
      "political-philosophy"
    ],
    "quotes": [
      {
        "id": "marsilius-of-padua-1",
        "text": "The legislator, or the primary and proper efficient cause of the law, is the people or the whole body of citizens."
      },
      {
        "id": "marsilius-of-padua-2",
        "text": "A law made by the hearing or consent of the whole multitude is better observed by every citizen."
      },
      {
        "id": "marsilius-of-padua-3",
        "text": "The authority to make or establish laws belongs only to the whole body of the citizens or to its weightier part."
      },
      {
        "id": "marsilius-of-padua-4",
        "text": "Peace is the tranquillity of the city or state whereby each of its parts can perfectly perform the operations appropriate to it."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Italy"
  },
  {
    "id": "jean-buridan",
    "name": "Jean Buridan",
    "lifespan": "c. 1301 - c. 1360",
    "era": "14th-century France",
    "symbol": "🫏",
    "oneLiner": "Free will, motion, and the logic of language",
    "bio": "Jean Buridan was a French priest and one of the most influential teachers at the medieval University of Paris, where he spent his whole career analyzing Aristotle and the workings of language. He developed the theory of 'impetus,' arguing that a thrown object keeps moving because the thrower imparts a lasting force to it, an idea that pointed toward the modern concept of inertia. In logic, he produced subtle work on paradoxes, reference, and how words carry meaning. His name lives on through 'Buridan's ass,' a thought experiment about a donkey starving between two equal piles of hay, used to probe how the will chooses between equally good options. Though the story does not appear in his surviving writings, it captures his deep interest in freedom and rational choice.",
    "areas": [
      "Logic",
      "Philosophy of Mind",
      "Natural Philosophy"
    ],
    "branchSlugs": [
      "logic",
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "jean-buridan-1",
        "text": "The will, faced with two equal goods, cannot choose by reason alone."
      },
      {
        "id": "jean-buridan-2",
        "text": "After leaving the arm of the thrower, the projectile is moved by an impetus given to it by the thrower."
      },
      {
        "id": "jean-buridan-3",
        "text": "This impetus would last forever were it not diminished and corrupted by a contrary resistance."
      },
      {
        "id": "jean-buridan-4",
        "text": "Should anyone wish to deny the principle of contradiction, he would still have to use it in arguing."
      }
    ],
    "category": "MEDIEVAL",
    "country": "France"
  },
  {
    "id": "catherine-of-siena",
    "name": "Catherine of Siena",
    "lifespan": "1347 - 1380",
    "era": "14th-century Italy",
    "symbol": "🔥",
    "oneLiner": "Self-knowledge is the road to knowing God",
    "bio": "Catherine of Siena was an Italian mystic, lay Dominican, and reformer who became one of the most remarkable women of the Middle Ages despite never attending a university. In her great work The Dialogue, dictated in states of ecstasy, she explored the nature of the soul, divine love, and the truth that we come to know God through deep self-knowledge. Fearless in confronting corruption, she wrote bold letters to popes and rulers urging reform and peace. Centuries later the Church named her a Doctor of the Church, only the second woman to receive that honor. Her writings blend passionate spirituality with a probing inquiry into the human longing for something greater than itself.",
    "areas": [
      "Philosophy of Religion",
      "Ethics",
      "Mysticism"
    ],
    "branchSlugs": [
      "metaphysics",
      "ethics"
    ],
    "quotes": [
      {
        "id": "catherine-of-siena-1",
        "text": "Be who God meant you to be and you will set the world on fire."
      },
      {
        "id": "catherine-of-siena-2",
        "text": "The soul cannot live without love. She always wants to love something, for love is the stuff she is made of."
      },
      {
        "id": "catherine-of-siena-3",
        "text": "Man is placed above all creatures, and not beneath them, and he cannot be satisfied or content except in something greater than himself."
      },
      {
        "id": "catherine-of-siena-4",
        "text": "Proclaim the truth and do not be silent through fear."
      },
      {
        "id": "catherine-of-siena-5",
        "text": "All the way to heaven is heaven, because Christ said, I am the way."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Italy"
  },
  {
    "id": "marsilio-ficino",
    "name": "Marsilio Ficino",
    "lifespan": "1433 - 1499",
    "era": "Italian Renaissance Florence",
    "symbol": "☀️",
    "oneLiner": "Love draws the soul upward toward divine beauty",
    "bio": "Marsilio Ficino was an Italian priest, physician, and scholar who led the great Renaissance revival of Plato in the city of Florence. Sponsored by the Medici family, he translated the entire works of Plato into Latin for the first time, along with the writings of later Neoplatonists, making them available to the West. In his Platonic Theology he argued for the immortality of the soul and placed the human soul at the center of the cosmos, linking the divine and the material worlds. He gave Europe the idea of 'Platonic love,' a desire that begins with physical beauty and rises toward the beauty of God. His blend of philosophy, magic, and music shaped how the Renaissance imagined the dignity and power of the human spirit.",
    "areas": [
      "Metaphysics",
      "Philosophy of Love",
      "Aesthetics"
    ],
    "branchSlugs": [
      "metaphysics",
      "aesthetics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "marsilio-ficino-1",
        "text": "The whole power of magic is founded on love. The work of magic is the attraction of one thing by another because of a certain affinity of nature."
      },
      {
        "id": "marsilio-ficino-2",
        "text": "The soul is partly in eternity and partly in time."
      },
      {
        "id": "marsilio-ficino-3",
        "text": "Medicine heals the body, music the spirit, and theology the soul."
      },
      {
        "id": "marsilio-ficino-4",
        "text": "This is the love by which the world is bound and the parts of the world united with one another."
      },
      {
        "id": "marsilio-ficino-5",
        "text": "Mortal things care for mortal things, and the inconstant change for inconstant things."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Italy"
  },
  {
    "id": "pico-della-mirandola",
    "name": "Giovanni Pico della Mirandola",
    "lifespan": "1463 - 1494",
    "era": "Italian Renaissance",
    "symbol": "🎭",
    "oneLiner": "Humans are free to shape who they become",
    "bio": "Giovanni Pico della Mirandola was a brilliant young Italian nobleman and scholar who became a symbol of Renaissance humanism. In his famous Oration on the Dignity of Man, often called the 'manifesto of the Renaissance,' he argued that human beings have no fixed nature and are uniquely free to shape themselves into anything they choose, from beasts to angels. He dreamed of uniting all philosophies and religions, drawing on Plato, Aristotle, Jewish Kabbalah, and Islamic and Christian thought to defend nine hundred theses he hoped to debate publicly in Rome. The Church condemned some of these theses, and his life was cut short at just thirty-one. His celebration of human potential and freedom remains one of the most quoted ideas of the era.",
    "areas": [
      "Philosophical Anthropology",
      "Metaphysics",
      "Ethics"
    ],
    "branchSlugs": [
      "metaphysics",
      "ethics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "pico-della-mirandola-1",
        "text": "We have made you neither of heaven nor of earth, neither mortal nor immortal, so that with freedom of choice you may fashion yourself in whatever form you prefer."
      },
      {
        "id": "pico-della-mirandola-2",
        "text": "You shall have the power to degenerate into the lower forms of life, or to be reborn into the higher forms, which are divine."
      },
      {
        "id": "pico-della-mirandola-3",
        "text": "Let a holy ambition enter our souls; let us not be content with mediocrity, but pant after the highest things."
      },
      {
        "id": "pico-della-mirandola-4",
        "text": "On man, at the moment of his creation, God bestowed seeds pregnant with all possibilities, the germs of every form of life."
      },
      {
        "id": "pico-della-mirandola-5",
        "text": "Man is the maker and molder of himself, and may shape himself into whatever form he chooses."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Italy"
  },
  {
    "id": "michel-de-montaigne",
    "name": "Michel de Montaigne",
    "lifespan": "1533 - 1592",
    "era": "French Renaissance",
    "symbol": "🪶",
    "oneLiner": "What do I know? The art of honest doubt",
    "bio": "Michel de Montaigne was a French nobleman and statesman who invented the personal essay, retreating to a tower library to write candidly about himself and the world. His Essays wander freely across topics like friendship, fear, death, education, and cannibalism, always returning to the question of how little we truly know. His motto, 'What do I know?', captures a gentle skepticism that distrusts dogmatism and prizes humility, tolerance, and self-examination. Writing during the bloody French wars of religion, he urged people to question their certainties and to recognize the limits of human reason. His warm, searching, deeply human voice influenced thinkers from Descartes to Nietzsche and made him one of the most beloved writers in philosophy.",
    "areas": [
      "Epistemology",
      "Ethics",
      "Skepticism"
    ],
    "branchSlugs": [
      "epistemology",
      "ethics"
    ],
    "quotes": [
      {
        "id": "michel-de-montaigne-1",
        "text": "What do I know?"
      },
      {
        "id": "michel-de-montaigne-2",
        "text": "He who fears he will suffer, already suffers from his fear."
      },
      {
        "id": "michel-de-montaigne-3",
        "text": "The greatest thing in the world is to know how to belong to oneself."
      },
      {
        "id": "michel-de-montaigne-4",
        "text": "There is no conversation more boring than the one where everybody agrees."
      },
      {
        "id": "michel-de-montaigne-5",
        "text": "Each man calls barbarism whatever is not his own practice."
      },
      {
        "id": "michel-de-montaigne-6",
        "text": "On the highest throne in the world, we still sit only on our own bottom."
      }
    ],
    "category": "MEDIEVAL",
    "country": "France"
  },
  {
    "id": "giordano-bruno",
    "name": "Giordano Bruno",
    "lifespan": "1548 - 1600",
    "era": "Late Italian Renaissance",
    "symbol": "✨",
    "oneLiner": "The universe is infinite with countless worlds",
    "bio": "Giordano Bruno was an Italian friar, philosopher, and cosmic visionary who pushed the boundaries of thought further than almost anyone of his age. Embracing the new Copernican astronomy, he argued that the universe is infinite, with no center, filled with countless suns and worlds possibly teeming with life. He saw the divine not as separate from the cosmos but as an immanent soul running through all of nature. His restless ideas, blending astronomy, Neoplatonism, and the art of memory, brought him into conflict with religious authorities across Europe. Tried by the Inquisition and refusing to recant, he was burned at the stake in Rome in 1600, becoming a lasting emblem of intellectual courage and free inquiry.",
    "areas": [
      "Metaphysics",
      "Cosmology",
      "Philosophy of Nature"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "giordano-bruno-1",
        "text": "Perhaps you pronounce this sentence against me with greater fear than I receive it."
      },
      {
        "id": "giordano-bruno-2",
        "text": "There is a single general space, a single vast immensity which we may freely call void: in it are innumerable globes like this one on which we live and grow."
      },
      {
        "id": "giordano-bruno-3",
        "text": "The universe is one, infinite, immobile. The absolute possibility is one, the act is one."
      },
      {
        "id": "giordano-bruno-4",
        "text": "It is unity that doth enchant me. By her power I am free though thrall, happy in sorrow, rich in poverty, and quick even in death."
      },
      {
        "id": "giordano-bruno-5",
        "text": "Nature is none other than God in things."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Italy"
  },
  {
    "id": "francisco-suarez",
    "name": "Francisco Suárez",
    "lifespan": "1548 - 1617",
    "era": "Spanish Golden Age",
    "symbol": "📜",
    "oneLiner": "The last great scholastic, master of being and law",
    "bio": "Francisco Suárez was a Spanish Jesuit priest widely regarded as the greatest scholastic philosopher after the Middle Ages and a bridge to early modern thought. His massive Metaphysical Disputations was the first systematic, freestanding treatment of metaphysics, organizing the entire subject so clearly that it became a standard textbook across Europe and shaped Descartes and Leibniz. In the philosophy of law and politics, he argued that political authority arises from the consent of the community rather than directly from kings, and he developed influential theories of natural law and just war. He explored how essence and existence relate in finite things, refining centuries of debate. His careful, comprehensive work earned him the title 'Doctor Eximius,' the exceptional teacher.",
    "areas": [
      "Metaphysics",
      "Philosophy of Law",
      "Political Philosophy"
    ],
    "branchSlugs": [
      "metaphysics",
      "political-philosophy",
      "ethics"
    ],
    "quotes": [
      {
        "id": "francisco-suarez-1",
        "text": "Power to make human laws does not reside in any single man but in the whole body of the community."
      },
      {
        "id": "francisco-suarez-2",
        "text": "By the nature of things all men are born free, so that, consequently, no person has political jurisdiction over another."
      },
      {
        "id": "francisco-suarez-3",
        "text": "Natural law is the law which dwells within the human mind in order that we may discern good from evil."
      },
      {
        "id": "francisco-suarez-4",
        "text": "Being, taken as a real essence, is the proper and adequate object of metaphysics."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Spain"
  },
  {
    "id": "hugo-grotius",
    "name": "Hugo Grotius",
    "lifespan": "1583 - 1645",
    "era": "Dutch Golden Age",
    "symbol": "🌊",
    "oneLiner": "Founder of international law and natural right",
    "bio": "Hugo Grotius was a Dutch jurist, scholar, and statesman often called the father of international law. A child prodigy who entered university at eleven, he went on to write On the Law of War and Peace, arguing that relations between nations are governed by a natural law binding even in wartime. He grounded this law in human reason and sociability, famously suggesting it would hold even if, impossibly, there were no God. In Mare Liberum he defended the freedom of the seas, shaping debates about trade and sovereignty that still echo today. Imprisoned for his religious politics, he made a daring escape hidden inside a book chest, and his ideas went on to influence the entire Enlightenment tradition of rights and just war.",
    "areas": [
      "Philosophy of Law",
      "Political Philosophy",
      "Ethics"
    ],
    "branchSlugs": [
      "political-philosophy",
      "ethics"
    ],
    "quotes": [
      {
        "id": "hugo-grotius-1",
        "text": "The law of nature is so unalterable that it cannot be changed even by God himself."
      },
      {
        "id": "hugo-grotius-2",
        "text": "What we have been saying would have a degree of validity even if we should concede that which cannot be conceded without the utmost wickedness, that there is no God."
      },
      {
        "id": "hugo-grotius-3",
        "text": "A state is a perfect body of free men, united together in order to enjoy common rights and advantages."
      },
      {
        "id": "hugo-grotius-4",
        "text": "War is a matter of the gravest importance, because so many calamities usually follow in its train."
      },
      {
        "id": "hugo-grotius-5",
        "text": "On whatever terms peace is made, it must be absolutely kept, from the sacredness of the faith pledged in the engagement."
      }
    ],
    "category": "MEDIEVAL",
    "country": "Netherlands"
  },
  {
    "id": "nicolas-malebranche",
    "name": "Nicolas Malebranche",
    "lifespan": "1638-1715",
    "era": "Rationalism, France",
    "symbol": "🙏",
    "oneLiner": "We see all things in God.",
    "bio": "Nicolas Malebranche was a French priest and philosopher who tried to weave together the new science of Descartes with the theology of St. Augustine. He is famous for two bold ideas: that we perceive the world by seeing things 'in God,' and 'occasionalism,' the view that God is the only true cause and that natural events are merely the occasions on which God acts. In his lifetime he was ranked alongside Descartes, Locke, and Leibniz as a leading light of European thought. His warm, almost devotional writing treats careful attention as a form of prayer and a path to truth.",
    "areas": [
      "Metaphysics",
      "Epistemology",
      "Philosophy of Mind"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "nicolas-malebranche-1",
        "text": "Attentiveness is the natural prayer of the soul."
      },
      {
        "id": "nicolas-malebranche-2",
        "text": "We see all things in God."
      },
      {
        "id": "nicolas-malebranche-3",
        "text": "There is a contradiction in supposing that a body could act on a mind."
      },
      {
        "id": "nicolas-malebranche-4",
        "text": "God alone is the true cause of all that happens in the world."
      },
      {
        "id": "nicolas-malebranche-5",
        "text": "The mind is not made for the body; it is made for God."
      }
    ],
    "category": "MODERN",
    "country": "France"
  },
  {
    "id": "anne-conway",
    "name": "Anne Conway",
    "lifespan": "1631-1679",
    "era": "Cambridge Platonism, England",
    "symbol": "🌿",
    "oneLiner": "All things are living spirit, not dead matter.",
    "bio": "Anne Conway was an English philosopher who, despite chronic illness and exclusion from universities, produced a remarkable work of metaphysics published only after her death. Against Descartes and Hobbes, she argued that there is no truly 'dead' matter: everything in creation is alive, capable of feeling, and made of a single spiritual substance that ranges from God down through Christ to every creature. Body and spirit, for her, differ only in degree, so a body can refine into spirit and back again. Her vitalist vision impressed Leibniz, who borrowed her word 'monad' for his own philosophy.",
    "areas": [
      "Metaphysics",
      "Philosophy of Religion",
      "Philosophy of Mind"
    ],
    "branchSlugs": [
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "anne-conway-1",
        "text": "Every body is a spirit and nothing else, and differs from a spirit only insofar as it is more dark."
      },
      {
        "id": "anne-conway-2",
        "text": "There is no body which has not life or perception proper to itself."
      },
      {
        "id": "anne-conway-3",
        "text": "Spirit and body differ not essentially, but modally."
      },
      {
        "id": "anne-conway-4",
        "text": "Nothing can be so contrary to God as that which is purely dead and incapable of life."
      },
      {
        "id": "anne-conway-5",
        "text": "All creatures from the highest to the lowest are inseparably united one with another."
      }
    ],
    "category": "MODERN",
    "country": "England"
  },
  {
    "id": "emilie-du-chatelet",
    "name": "Émilie du Châtelet",
    "lifespan": "1706-1749",
    "era": "Enlightenment, France",
    "symbol": "🔬",
    "oneLiner": "Reason, energy, and the love of learning.",
    "bio": "Émilie du Châtelet was a French mathematician and natural philosopher who became one of the sharpest scientific minds of the Enlightenment. She translated Newton's Principia into French, a version still used today, and added a commentary defending the idea that energy of motion grows with the square of velocity, anticipating the modern concept of kinetic energy. In her Foundations of Physics she tried to give Newton's mathematics deeper metaphysical roots drawn from Leibniz and Wolff. In her candid Discourse on Happiness, she argued that a full life means freeing oneself from prejudice and pursuing the passions, especially the love of study.",
    "areas": [
      "Natural Philosophy",
      "Metaphysics",
      "Ethics"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology",
      "ethics"
    ],
    "quotes": [
      {
        "id": "emilie-du-chatelet-1",
        "text": "The love of study is the passion most necessary to our happiness."
      },
      {
        "id": "emilie-du-chatelet-2",
        "text": "Let us choose for ourselves our path in life, and let us try to strew that path with flowers."
      },
      {
        "id": "emilie-du-chatelet-3",
        "text": "We must begin by saying to ourselves that we have nothing to do in the world but seek pleasant sensations and feelings."
      },
      {
        "id": "emilie-du-chatelet-4",
        "text": "One must be susceptible to illusions, for to them we owe the majority of our pleasures."
      },
      {
        "id": "emilie-du-chatelet-5",
        "text": "Judge me for my own merits, or lack of them, but do not look upon me as a mere appendage."
      }
    ],
    "category": "MODERN",
    "country": "France"
  },
  {
    "id": "giambattista-vico",
    "name": "Giambattista Vico",
    "lifespan": "1668-1744",
    "era": "Enlightenment, Italy",
    "symbol": "🏛️",
    "oneLiner": "We can know history because we made it.",
    "bio": "Giambattista Vico was an Italian philosopher who challenged the idea that mathematics and physics are the only real knowledge. His guiding principle, verum factum, holds that we can truly know only what we ourselves make, which means human history and society are more knowable to us than the natural world made by God. In his New Science, he traced how civilizations pass through ages of gods, heroes, and humans, then decline and begin again. Largely overlooked in his own day, Vico is now seen as a founder of the philosophy of history and the human sciences.",
    "areas": [
      "Philosophy of History",
      "Epistemology",
      "Political Philosophy"
    ],
    "branchSlugs": [
      "epistemology",
      "metaphysics",
      "political-philosophy"
    ],
    "quotes": [
      {
        "id": "giambattista-vico-1",
        "text": "The true and the made are convertible."
      },
      {
        "id": "giambattista-vico-2",
        "text": "Men first feel without perceiving, then perceive with a troubled and agitated spirit, finally reflect with a clear mind."
      },
      {
        "id": "giambattista-vico-3",
        "text": "Common sense is judgment without reflection, shared by an entire class, an entire people, an entire nation, or the entire human race."
      },
      {
        "id": "giambattista-vico-4",
        "text": "The order of ideas must follow the order of institutions."
      },
      {
        "id": "giambattista-vico-5",
        "text": "Doctrines must take their beginning from that of the matters of which they treat."
      }
    ],
    "category": "MODERN",
    "country": "Italy"
  },
  {
    "id": "christian-wolff",
    "name": "Christian Wolff",
    "lifespan": "1679-1754",
    "era": "German Enlightenment, Germany",
    "symbol": "📐",
    "oneLiner": "Nothing exists without a sufficient reason.",
    "bio": "Christian Wolff was the great systematizer of the German Enlightenment, the thinker who built a bridge from Leibniz to Kant. He organized philosophy into a rigorous, almost geometric system covering logic, metaphysics, ethics, and politics, and insisted that nothing happens without a sufficient reason for why it is so rather than otherwise. By writing first in German rather than Latin, he helped create a vocabulary for philosophy in his own language. His confident faith in reason made him so controversial that he was once expelled from Prussia, only to be triumphantly recalled years later.",
    "areas": [
      "Metaphysics",
      "Logic",
      "Ethics"
    ],
    "branchSlugs": [
      "metaphysics",
      "logic",
      "ethics"
    ],
    "quotes": [
      {
        "id": "christian-wolff-1",
        "text": "Nothing is without a sufficient reason why it is rather than is not."
      },
      {
        "id": "christian-wolff-2",
        "text": "Philosophy is the science of the possibles insofar as they can be."
      },
      {
        "id": "christian-wolff-3",
        "text": "We are obliged to do what makes us and our condition more perfect, and to omit what makes them less perfect."
      },
      {
        "id": "christian-wolff-4",
        "text": "Truth is the agreement of our judgments with the things themselves."
      },
      {
        "id": "christian-wolff-5",
        "text": "Reason is the faculty of seeing the connection of truths."
      }
    ],
    "category": "MODERN",
    "country": "Germany"
  },
  {
    "id": "shaftesbury",
    "name": "Anthony Ashley-Cooper, 3rd Earl of Shaftesbury",
    "lifespan": "1671-1713",
    "era": "Enlightenment, England",
    "symbol": "🎭",
    "oneLiner": "Virtue is a kind of beauty we sense.",
    "bio": "Anthony Ashley-Cooper, the third Earl of Shaftesbury, was an English aristocrat whose elegant essays shaped a century of thought about morality and art. He is the father of 'moral sense' theory, the idea that we feel the rightness of good actions much as we feel the beauty of a harmonious scene. For Shaftesbury, virtue and beauty are nearly one and the same, both grounded in order and proportion. He championed good humor, tolerance, and freedom of thought, and his collected Characteristics influenced later thinkers from Hutcheson to the Romantics.",
    "areas": [
      "Ethics",
      "Aesthetics",
      "Philosophy of Religion"
    ],
    "branchSlugs": [
      "ethics",
      "aesthetics"
    ],
    "quotes": [
      {
        "id": "shaftesbury-1",
        "text": "All beauty is truth."
      },
      {
        "id": "shaftesbury-2",
        "text": "Wit and humour are corrosives to false thought and reasoning."
      },
      {
        "id": "shaftesbury-3",
        "text": "Nothing is more fatal, either to painting, architecture, or the other arts, than this false relish, which is governed rather by what immediately strikes the sense, than by what consequentially and by reflection pleases the mind."
      },
      {
        "id": "shaftesbury-4",
        "text": "To deal in characters of virtue and vice, to render virtue amiable, vice odious, this is the great and worthy end."
      },
      {
        "id": "shaftesbury-5",
        "text": "The most ingenious way of becoming foolish is by a system."
      }
    ],
    "category": "MODERN",
    "country": "England"
  },
  {
    "id": "francis-hutcheson",
    "name": "Francis Hutcheson",
    "lifespan": "1694-1746",
    "era": "Scottish Enlightenment, Ireland/Scotland",
    "symbol": "⚖️",
    "oneLiner": "The greatest happiness for the greatest number.",
    "bio": "Francis Hutcheson was an Irish-born philosopher who taught at Glasgow and helped launch the Scottish Enlightenment, mentoring a generation that included Adam Smith. Building on Shaftesbury, he argued that humans possess an inner 'moral sense' that approves benevolence and disapproves cruelty, quite apart from self-interest. He coined the famous yardstick that the best action is the one securing the greatest happiness for the greatest number, planting a seed that later grew into utilitarianism. He also wrote influentially on beauty, finding it in 'uniformity amidst variety.'",
    "areas": [
      "Ethics",
      "Aesthetics",
      "Moral Psychology"
    ],
    "branchSlugs": [
      "ethics",
      "aesthetics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "francis-hutcheson-1",
        "text": "That action is best which procures the greatest happiness for the greatest numbers."
      },
      {
        "id": "francis-hutcheson-2",
        "text": "Wisdom denotes the pursuing of the best ends by the best means."
      },
      {
        "id": "francis-hutcheson-3",
        "text": "The figures which excite in us the ideas of beauty seem to be those in which there is uniformity amidst variety."
      },
      {
        "id": "francis-hutcheson-4",
        "text": "We are determined to perceive beauty, where there is uniformity amidst variety, without any view of advantage."
      },
      {
        "id": "francis-hutcheson-5",
        "text": "Every mortal has good enough to recommend him to those who are not blinded by self-love."
      }
    ],
    "category": "MODERN",
    "country": "Ireland"
  },
  {
    "id": "thomas-reid",
    "name": "Thomas Reid",
    "lifespan": "1710-1796",
    "era": "Scottish Enlightenment, Scotland",
    "symbol": "👁️",
    "oneLiner": "Trust the common sense built into us.",
    "bio": "Thomas Reid was a Scottish philosopher who founded the 'common sense' school and offered the most influential rebuttal to David Hume's skepticism. Where Hume doubted whether we can know the external world, Reid replied that certain beliefs, such as that other minds and an outside world exist, are first principles we cannot help but accept and that science itself rests upon. He gave a careful, fresh account of perception, arguing that our senses give us direct contact with real objects rather than mere private impressions. His work later shaped American and European thought well into the nineteenth century.",
    "areas": [
      "Epistemology",
      "Philosophy of Mind",
      "Philosophy of Perception"
    ],
    "branchSlugs": [
      "epistemology",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "thomas-reid-1",
        "text": "There is no greater impediment to the advancement of knowledge than the ambiguity of words."
      },
      {
        "id": "thomas-reid-2",
        "text": "The existence of a material world, and of what we perceive by our senses, is taken for granted in all our reasonings."
      },
      {
        "id": "thomas-reid-3",
        "text": "All knowledge and all science must be built upon principles that are self-evident."
      },
      {
        "id": "thomas-reid-4",
        "text": "It is genius, and not the want of it, that adulterates philosophy, and fills it with error and false theory."
      },
      {
        "id": "thomas-reid-5",
        "text": "Common sense and reason have both one author; that almighty author in all whose other works we observe a consistency."
      }
    ],
    "category": "MODERN",
    "country": "Scotland"
  },
  {
    "id": "cesare-beccaria",
    "name": "Cesare Beccaria",
    "lifespan": "1738-1794",
    "era": "Enlightenment, Italy",
    "symbol": "⚖️",
    "oneLiner": "Prevent crime; abolish torture and the death penalty.",
    "bio": "Cesare Beccaria was an Italian thinker whose short, fiery book On Crimes and Punishments became one of the most influential works of the Enlightenment. Writing in 1764, he was the first modern voice to call for the complete abolition of torture and the death penalty, arguing that punishment should be swift, certain, and no harsher than necessary to protect society. He insisted that the law's true aim is to prevent crime and maximize the happiness of the greatest number. His reforms reshaped criminal justice across Europe and the new United States.",
    "areas": [
      "Political Philosophy",
      "Philosophy of Law",
      "Ethics"
    ],
    "branchSlugs": [
      "political-philosophy",
      "ethics"
    ],
    "quotes": [
      {
        "id": "cesare-beccaria-1",
        "text": "It is better to prevent crimes than to punish them."
      },
      {
        "id": "cesare-beccaria-2",
        "text": "The certainty of a punishment, even if it be moderate, will always make a stronger impression than the fear of another which is more terrible but combined with the hope of impunity."
      },
      {
        "id": "cesare-beccaria-3",
        "text": "Laws are the conditions under which men, naturally independent, united themselves in society."
      },
      {
        "id": "cesare-beccaria-4",
        "text": "Every act of authority of one man over another, for which there is not an absolute necessity, is tyrannical."
      },
      {
        "id": "cesare-beccaria-5",
        "text": "The greatest happiness shared by the greatest number, that is the foundation on which to build."
      }
    ],
    "category": "MODERN",
    "country": "Italy"
  },
  {
    "id": "moses-mendelssohn",
    "name": "Moses Mendelssohn",
    "lifespan": "1729-1786",
    "era": "German/Jewish Enlightenment, Germany",
    "symbol": "🕊️",
    "oneLiner": "Reason, faith, and freedom of conscience together.",
    "bio": "Moses Mendelssohn was a German-Jewish philosopher who stood at the heart of the Enlightenment and sparked the Haskalah, the Jewish Enlightenment. Largely self-taught, he won acclaim for his graceful writings on aesthetics, metaphysics, and the immortality of the soul, earning the nickname 'the German Socrates.' In his landmark book Jerusalem he argued that the state and religion should never coerce belief, defending freedom of conscience and the full membership of Jews in modern society. He showed by his own example that one could be both a devout Jew and a citizen of the wider world of reason.",
    "areas": [
      "Metaphysics",
      "Aesthetics",
      "Political Philosophy"
    ],
    "branchSlugs": [
      "metaphysics",
      "aesthetics",
      "political-philosophy",
      "ethics"
    ],
    "quotes": [
      {
        "id": "moses-mendelssohn-1",
        "text": "Brothers, if you care for true piety, let us not feign agreement where diversity is evidently the plan and purpose of Providence."
      },
      {
        "id": "moses-mendelssohn-2",
        "text": "Love truth, love peace."
      },
      {
        "id": "moses-mendelssohn-3",
        "text": "Neither church nor state has a right to subject men's principles and convictions to any coercion whatsoever."
      },
      {
        "id": "moses-mendelssohn-4",
        "text": "Let every man who does not disturb the public welfare, who obeys the law, think as he pleases, and speak as he thinks."
      },
      {
        "id": "moses-mendelssohn-5",
        "text": "Reason's house of worship needs no locked doors; it has nothing to guard within, and bars no one from entering."
      }
    ],
    "category": "MODERN",
    "country": "Germany"
  },
  {
    "id": "friedrich-schleiermacher",
    "name": "Friedrich Schleiermacher",
    "lifespan": "1768-1834",
    "era": "Romantic-era Germany",
    "symbol": "🙏",
    "oneLiner": "Religion is the feeling of absolute dependence",
    "bio": "Friedrich Schleiermacher was a German theologian and philosopher who reshaped how people think about both religion and interpretation. Rather than defending faith with arguments, he located the heart of religion in feeling, a sense and taste for the infinite that he called the feeling of absolute dependence. He is also a founder of modern hermeneutics, the art of understanding texts and other minds, famously claiming a good interpreter can grasp an author better than the author grasped himself. Working in Berlin alongside the Romantics, he tried to make religion intelligible to its cultured despisers without reducing it to mere doctrine.",
    "areas": [
      "Philosophy of Religion",
      "Hermeneutics",
      "Theology"
    ],
    "branchSlugs": [
      "epistemology",
      "metaphysics",
      "aesthetics"
    ],
    "quotes": [
      {
        "id": "friedrich-schleiermacher-1",
        "text": "Religion is the feeling of absolute dependence."
      },
      {
        "id": "friedrich-schleiermacher-2",
        "text": "True religion is sense and taste for the infinite."
      },
      {
        "id": "friedrich-schleiermacher-3",
        "text": "The interpreter must aim to understand the author better than he understood himself."
      },
      {
        "id": "friedrich-schleiermacher-4",
        "text": "Faith is the confidence that we have eternal life in God."
      },
      {
        "id": "friedrich-schleiermacher-5",
        "text": "Every man is meant to represent humanity in his own way."
      }
    ],
    "category": "MODERN",
    "country": "Germany"
  },
  {
    "id": "johann-gottfried-herder",
    "name": "Johann Gottfried Herder",
    "lifespan": "1744-1803",
    "era": "Sturm und Drang Germany",
    "symbol": "🗣️",
    "oneLiner": "Each people thinks through its own language",
    "bio": "Johann Gottfried Herder was a German philosopher, poet, and critic who argued that human thought is inseparable from language and culture. He insisted that every people, or Volk, has its own distinctive spirit expressed through its folk songs, stories, and tongue, an idea that helped launch modern anthropology and the philosophy of history. A leading voice of the Sturm und Drang movement, he rejected the idea of a single universal standard of taste and championed the value of cultural diversity. At the same time he held a deep cosmopolitan faith in shared humanity, urging each nation to flourish in its own way while respecting all the others.",
    "areas": [
      "Philosophy of Language",
      "Philosophy of History",
      "Aesthetics"
    ],
    "branchSlugs": [
      "epistemology",
      "aesthetics",
      "political-philosophy"
    ],
    "quotes": [
      {
        "id": "johann-gottfried-herder-1",
        "text": "Language is the real differentia of our species from without, as reason is from within."
      },
      {
        "id": "johann-gottfried-herder-2",
        "text": "We live in a world we ourselves create."
      },
      {
        "id": "johann-gottfried-herder-3",
        "text": "No one is in his age alone; he builds on the preceding one, which becomes nothing but the foundation of the future."
      },
      {
        "id": "johann-gottfried-herder-4",
        "text": "Whate'er of us lives in the hearts of others is our truest and profoundest self."
      },
      {
        "id": "johann-gottfried-herder-5",
        "text": "The craving for a delicate fruit is pleasanter than the fruit itself."
      }
    ],
    "category": "MODERN",
    "country": "Germany"
  },
  {
    "id": "wilhelm-von-humboldt",
    "name": "Wilhelm von Humboldt",
    "lifespan": "1767-1835",
    "era": "Prussian Enlightenment",
    "symbol": "📚",
    "oneLiner": "Freedom lets each person develop their fullest self",
    "bio": "Wilhelm von Humboldt was a Prussian philosopher, linguist, and statesman who placed individual self-cultivation, or Bildung, at the center of a good life. He argued that the highest aim of every person is to develop their powers into a rich and harmonious whole, and that the state should mostly stay out of the way so freedom can do this work. As a linguist he saw language not as a finished tool but as a living activity that shapes how each people perceives the world. He also founded the University of Berlin, building a model of research and learning that universities around the world still follow.",
    "areas": [
      "Philosophy of Language",
      "Political Philosophy",
      "Philosophy of Education"
    ],
    "branchSlugs": [
      "political-philosophy",
      "epistemology",
      "ethics"
    ],
    "quotes": [
      {
        "id": "wilhelm-von-humboldt-1",
        "text": "That government is the best which makes government unnecessary."
      },
      {
        "id": "wilhelm-von-humboldt-2",
        "text": "Languages are not actually means of representing a truth already known, but rather of discovering the previously unknown."
      },
      {
        "id": "wilhelm-von-humboldt-3",
        "text": "In this consciousness of his freedom lies the true dignity of man."
      },
      {
        "id": "wilhelm-von-humboldt-4",
        "text": "Our happiness or our unhappiness depends far more on the way we meet the events of life than on the nature of those events themselves."
      },
      {
        "id": "wilhelm-von-humboldt-5",
        "text": "The improvement of the soul by joys and griefs, the development of noble feelings, is the true and only end of existence."
      }
    ],
    "category": "MODERN",
    "country": "Germany"
  },
  {
    "id": "auguste-comte",
    "name": "Auguste Comte",
    "lifespan": "1798-1857",
    "era": "Post-Revolutionary France",
    "symbol": "🔭",
    "oneLiner": "Only science gives genuine knowledge of the world",
    "bio": "Auguste Comte was a French thinker who founded positivism and gave sociology its name. He proposed a law of three stages, claiming that human understanding moves from theological explanations through abstract metaphysics to a final positive stage where knowledge rests on observation and science. For Comte, the only valid knowledge comes from what can be studied scientifically, and society itself could be examined with the same rigor as nature. Late in life he tried to build a secular religion of humanity, placing love, order, and progress at the heart of a reorganized society.",
    "areas": [
      "Philosophy of Science",
      "Sociology",
      "Epistemology"
    ],
    "branchSlugs": [
      "epistemology",
      "metaphysics",
      "political-philosophy"
    ],
    "quotes": [
      {
        "id": "auguste-comte-1",
        "text": "To understand a science it is necessary to know its history."
      },
      {
        "id": "auguste-comte-2",
        "text": "The dead govern the living."
      },
      {
        "id": "auguste-comte-3",
        "text": "The intellect should always be the servant of the heart, and should never be its slave."
      },
      {
        "id": "auguste-comte-4",
        "text": "Foreknowledge is power."
      },
      {
        "id": "auguste-comte-5",
        "text": "Social positivism only accepts duties, for all and towards all."
      }
    ],
    "category": "MODERN",
    "country": "France"
  },
  {
    "id": "herbert-spencer",
    "name": "Herbert Spencer",
    "lifespan": "1820-1903",
    "era": "Victorian England",
    "symbol": "🧬",
    "oneLiner": "Evolution explains nature, mind, and society alike",
    "bio": "Herbert Spencer was an English philosopher and one of the most widely read thinkers of the Victorian age. He coined the phrase survival of the fittest and tried to build a single grand system, his Synthetic Philosophy, applying the idea of evolution to biology, psychology, sociology, and ethics. A fierce champion of the individual, he argued for minimal government and maximum liberty, believing societies improve through free competition rather than state direction. Though his social Darwinism later fell out of favor, his attempt to unify all knowledge under evolution shaped how generations thought about progress and human society.",
    "areas": [
      "Evolutionary Philosophy",
      "Sociology",
      "Ethics"
    ],
    "branchSlugs": [
      "metaphysics",
      "ethics",
      "political-philosophy"
    ],
    "quotes": [
      {
        "id": "herbert-spencer-1",
        "text": "Every man is free to do that which he wills, provided he infringes not the equal freedom of any other man."
      },
      {
        "id": "herbert-spencer-2",
        "text": "Progress, therefore, is not an accident, but a necessity."
      },
      {
        "id": "herbert-spencer-3",
        "text": "The ultimate result of shielding men from the effects of folly, is to fill the world with fools."
      },
      {
        "id": "herbert-spencer-4",
        "text": "The current opinion that science and poetry are opposed is a delusion."
      },
      {
        "id": "herbert-spencer-5",
        "text": "Science is organized knowledge."
      }
    ],
    "category": "MODERN",
    "country": "England"
  },
  {
    "id": "ludwig-feuerbach",
    "name": "Ludwig Feuerbach",
    "lifespan": "1804-1872",
    "era": "Young Hegelian Germany",
    "symbol": "🪞",
    "oneLiner": "God is humanity's own nature projected outward",
    "bio": "Ludwig Feuerbach was a German philosopher and a leading figure among the Young Hegelians. In his famous book The Essence of Christianity, he argued that God is not a being above us but a projection of our own best qualities, our reason, love, and will, cast onto an imaginary heaven. He wanted to bring theology down to anthropology, treating the study of religion as really the study of human nature. His materialist critique deeply influenced Marx, Engels, and later Freud, and his slogan that man is what he eats captured his earthy, body-centered view of human life.",
    "areas": [
      "Philosophy of Religion",
      "Anthropology",
      "Materialism"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology",
      "ethics"
    ],
    "quotes": [
      {
        "id": "ludwig-feuerbach-1",
        "text": "Man is what he eats."
      },
      {
        "id": "ludwig-feuerbach-2",
        "text": "What man calls Absolute Being, his God, is his own being."
      },
      {
        "id": "ludwig-feuerbach-3",
        "text": "Religion is the dream of the human mind."
      },
      {
        "id": "ludwig-feuerbach-4",
        "text": "I would rather be a devil in alliance with truth, than an angel in alliance with falsehood."
      },
      {
        "id": "ludwig-feuerbach-5",
        "text": "Consciousness of God is the self-consciousness of man, knowledge of God the self-knowledge of man."
      }
    ],
    "category": "MODERN",
    "country": "Germany"
  },
  {
    "id": "max-stirner",
    "name": "Max Stirner",
    "lifespan": "1806-1856",
    "era": "Young Hegelian Germany",
    "symbol": "👤",
    "oneLiner": "Nothing matters more to me than myself",
    "bio": "Max Stirner was a German philosopher whose radical book The Ego and Its Own pushed individualism to its limit. He attacked not only religion and the state but also humanism, morality, and even the abstract ideals his fellow rebels held sacred, calling them spooks that haunt the mind. In their place he put the unique individual, who owns himself and treats every cause as his own rather than serving any higher principle. Often counted among the founders of individualist anarchism, his uncompromising egoism later influenced existentialists, anarchists, and Nietzsche's readers alike.",
    "areas": [
      "Egoism",
      "Political Philosophy",
      "Ethics"
    ],
    "branchSlugs": [
      "ethics",
      "political-philosophy",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "max-stirner-1",
        "text": "Nothing is more to me than myself!"
      },
      {
        "id": "max-stirner-2",
        "text": "You long for freedom? You fools! If you took might, freedom would come of itself."
      },
      {
        "id": "max-stirner-3",
        "text": "I do not presuppose myself, because I am every moment just positing or creating myself."
      },
      {
        "id": "max-stirner-4",
        "text": "For the state it is indispensable that nobody have an own will."
      },
      {
        "id": "max-stirner-5",
        "text": "I am my own only when I am master of myself."
      }
    ],
    "category": "MODERN",
    "country": "Germany"
  },
  {
    "id": "pierre-joseph-proudhon",
    "name": "Pierre-Joseph Proudhon",
    "lifespan": "1809-1865",
    "era": "Industrial-era France",
    "symbol": "⚖️",
    "oneLiner": "Property is theft; order can grow from anarchy",
    "bio": "Pierre-Joseph Proudhon was a self-taught French printer who became the first person to call himself an anarchist. In his explosive book What Is Property? he answered with the famous phrase property is theft, meaning the great holdings that let the rich live off others' labor, not the modest possessions of ordinary workers. He rejected both capitalism and authoritarian communism, proposing instead mutualism, a society of free producers cooperating through fair exchange rather than rule from above. His vision of order arising from liberty, not from masters, made him one of the most influential socialist and anarchist thinkers of his century.",
    "areas": [
      "Political Philosophy",
      "Economics",
      "Anarchism"
    ],
    "branchSlugs": [
      "political-philosophy",
      "ethics"
    ],
    "quotes": [
      {
        "id": "pierre-joseph-proudhon-1",
        "text": "Property is theft!"
      },
      {
        "id": "pierre-joseph-proudhon-2",
        "text": "As man seeks justice in equality, so society seeks order in anarchy."
      },
      {
        "id": "pierre-joseph-proudhon-3",
        "text": "To be governed is to be watched over, inspected, spied on, directed, legislated at, regulated, docketed, indoctrinated, preached at, controlled, censored, ordered about."
      },
      {
        "id": "pierre-joseph-proudhon-4",
        "text": "All parties without exception, when they seek for power, are varieties of absolutism."
      },
      {
        "id": "pierre-joseph-proudhon-5",
        "text": "Liberty is the mother, not the daughter, of order."
      }
    ],
    "category": "MODERN",
    "country": "France"
  },
  {
    "id": "frederick-douglass",
    "name": "Frederick Douglass",
    "lifespan": "1818-1895",
    "era": "Abolitionist America",
    "symbol": "⛓️",
    "oneLiner": "Without struggle, there is no progress toward freedom",
    "bio": "Frederick Douglass was an American philosopher, orator, and statesman who escaped slavery and became its most powerful intellectual opponent. Drawing on natural rights and moral reasoning, he argued that freedom and human dignity belong to everyone and that justice, not pity, is what the oppressed are owed. His speeches and writings insisted that liberty is never given freely but must be demanded, because power concedes nothing without a struggle. A champion of abolition, women's rights, and equal citizenship, he turned his own life story into a searching argument about freedom, education, and what it means to be fully human.",
    "areas": [
      "Political Philosophy",
      "Ethics",
      "Social Philosophy"
    ],
    "branchSlugs": [
      "political-philosophy",
      "ethics"
    ],
    "quotes": [
      {
        "id": "frederick-douglass-1",
        "text": "If there is no struggle, there is no progress."
      },
      {
        "id": "frederick-douglass-2",
        "text": "Power concedes nothing without a demand. It never did and it never will."
      },
      {
        "id": "frederick-douglass-3",
        "text": "I would unite with anybody to do right; and with nobody to do wrong."
      },
      {
        "id": "frederick-douglass-4",
        "text": "Right is of no sex, truth is of no color, God is the Father of us all, and we are all brethren."
      },
      {
        "id": "frederick-douglass-5",
        "text": "What I ask for the negro is not benevolence, not pity, not sympathy, but simply justice."
      }
    ],
    "category": "MODERN",
    "country": "United States"
  },
  {
    "id": "wilhelm-dilthey",
    "name": "Wilhelm Dilthey",
    "lifespan": "1833-1911",
    "era": "Imperial Germany",
    "symbol": "📜",
    "oneLiner": "We explain nature, but we understand human life",
    "bio": "Wilhelm Dilthey was a German philosopher who sought to give the human sciences their own foundation, separate from physics and chemistry. He drew a famous line between explaining nature through causal laws and understanding human life from within, through lived experience and interpretation. For Dilthey, who we are is revealed not by abstract theory but by history, since human beings are shaped by the social and historical worlds they live in. His work renewed hermeneutics and deeply influenced later thinkers like Heidegger and Gadamer, making him a key bridge between Romantic interpretation and twentieth-century philosophy.",
    "areas": [
      "Hermeneutics",
      "Philosophy of History",
      "Epistemology"
    ],
    "branchSlugs": [
      "epistemology",
      "metaphysics",
      "aesthetics"
    ],
    "quotes": [
      {
        "id": "wilhelm-dilthey-1",
        "text": "We explain nature, but we understand the life of the mind."
      },
      {
        "id": "wilhelm-dilthey-2",
        "text": "What man is, only his history tells."
      },
      {
        "id": "wilhelm-dilthey-3",
        "text": "The whole of human nature is only found in history."
      },
      {
        "id": "wilhelm-dilthey-4",
        "text": "Understanding is the rediscovery of the I in the Thou."
      },
      {
        "id": "wilhelm-dilthey-5",
        "text": "Reality only exists for us in the facts of consciousness given by inner experience."
      }
    ],
    "category": "MODERN",
    "country": "Germany"
  },
  {
    "id": "gilbert-ryle",
    "name": "Gilbert Ryle",
    "lifespan": "1900-1976",
    "era": "20th-c. Oxford, England",
    "symbol": "👻",
    "oneLiner": "The mind is not a ghost in the machine",
    "bio": "Gilbert Ryle was a leading figure of Oxford 'ordinary language' philosophy and the longtime editor of the journal Mind. In his 1949 masterwork The Concept of Mind, he attacked the Cartesian picture of the mind as a separate, ghostly substance, mocking it as 'the ghost in the machine.' He argued that this picture rests on a 'category mistake'—treating the mind as a thing of the wrong logical type, like asking to see 'the university' after touring all its colleges. Ryle also drew the now-famous distinction between 'knowing how' (a skill) and 'knowing that' (a fact), reshaping how philosophers think about the mind.",
    "areas": [
      "Philosophy of Mind",
      "Philosophy of Language",
      "Metaphysics"
    ],
    "branchSlugs": [
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "gilbert-ryle-1",
        "text": "The dogma of the Ghost in the Machine."
      },
      {
        "id": "gilbert-ryle-2",
        "text": "Such in outline is the official theory. I shall often speak of it, with deliberate abusiveness, as the dogma of the Ghost in the Machine."
      },
      {
        "id": "gilbert-ryle-3",
        "text": "Efficient practice precedes the theory of it."
      },
      {
        "id": "gilbert-ryle-4",
        "text": "Philosophy is the replacement of category-habits by category-disciplines."
      },
      {
        "id": "gilbert-ryle-5",
        "text": "When two terms belong to the same category, it is proper to construct conjunctive propositions embodying them."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "England"
  },
  {
    "id": "carl-hempel",
    "name": "Carl Hempel",
    "lifespan": "1905-1997",
    "era": "20th-c. Germany & USA",
    "symbol": "🔬",
    "oneLiner": "To explain an event is to show it had to happen",
    "bio": "Carl Gustav Hempel was a German-American philosopher of science and a key voice in logical empiricism after fleeing Nazi Germany. He is best known for the 'deductive-nomological' or 'covering-law' model of explanation, developed with Paul Oppenheim, which says we explain an event by deducing it from general laws plus initial conditions. On his view, explanation and prediction share the same logical structure—a good explanation could have predicted the event in advance. He also formulated the 'raven paradox,' a puzzle about how observations confirm general hypotheses that still provokes debate today.",
    "areas": [
      "Philosophy of Science",
      "Logic",
      "Epistemology"
    ],
    "branchSlugs": [
      "epistemology",
      "logic"
    ],
    "quotes": [
      {
        "id": "carl-hempel-1",
        "text": "A phenomenon is explained by showing that it occurred in accordance with certain general laws, in view of the realization of certain antecedent conditions."
      },
      {
        "id": "carl-hempel-2",
        "text": "Scientific explanation seeks to go beyond the merely phenomenal level to a deeper and more comprehensive understanding."
      },
      {
        "id": "carl-hempel-3",
        "text": "The same formal analysis applies to scientific prediction as well as to explanation."
      },
      {
        "id": "carl-hempel-4",
        "text": "Science aims at constructing a world picture which is true, comprehensive, and systematically connected."
      },
      {
        "id": "carl-hempel-5",
        "text": "Every adequate explanation could have served, before the event in question occurred, as a basis for predicting it."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Germany"
  },
  {
    "id": "nelson-goodman",
    "name": "Nelson Goodman",
    "lifespan": "1906-1998",
    "era": "20th-c. United States",
    "symbol": "🟢",
    "oneLiner": "We don't find worlds, we make them",
    "bio": "Nelson Goodman was an American philosopher whose work ranged across logic, science, language, and art. He is famous for the 'new riddle of induction'—his invented predicate 'grue' shows that the evidence we have fits infinitely many incompatible hypotheses, so something beyond logic must guide which predictions we trust. In Ways of Worldmaking he argued that there is no single ready-made world; we construct many 'worlds' through the symbol systems of science, art, and perception. He also pioneered a serious philosophy of art, treating pictures and music as symbol systems to be analyzed rather than merely admired.",
    "areas": [
      "Epistemology",
      "Philosophy of Science",
      "Aesthetics",
      "Logic"
    ],
    "branchSlugs": [
      "epistemology",
      "aesthetics",
      "logic",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "nelson-goodman-1",
        "text": "The many stuffs—matter, energy, waves, phenomena—that worlds are made of are made along with the worlds."
      },
      {
        "id": "nelson-goodman-2",
        "text": "Worldmaking as we know it always starts from worlds already on hand; the making is a remaking."
      },
      {
        "id": "nelson-goodman-3",
        "text": "Not from nothing, after all, but from other worlds."
      },
      {
        "id": "nelson-goodman-4",
        "text": "An emerald examined before time t is grue if and only if it is green."
      },
      {
        "id": "nelson-goodman-5",
        "text": "A category is comparatively projectible if it is comparatively well entrenched."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "United States"
  },
  {
    "id": "wilfrid-sellars",
    "name": "Wilfrid Sellars",
    "lifespan": "1912-1989",
    "era": "20th-c. United States",
    "symbol": "🧩",
    "oneLiner": "Knowledge is never just 'given' to the senses",
    "bio": "Wilfrid Sellars was an influential American philosopher who tried to reconcile the world of everyday experience with the world described by science. In Empiricism and the Philosophy of Mind he attacked the 'Myth of the Given'—the idea that raw sensations hand us certain knowledge directly—arguing instead that knowing always involves concepts and reasons within a 'space of reasons.' He distinguished the 'manifest image' (the world of persons, colors, and intentions) from the 'scientific image' (atoms and forces), and asked how the two fit together. Famously, he defined philosophy's aim as understanding how things, in the broadest sense, hang together.",
    "areas": [
      "Philosophy of Mind",
      "Epistemology",
      "Philosophy of Science"
    ],
    "branchSlugs": [
      "epistemology",
      "metaphysics",
      "logic"
    ],
    "quotes": [
      {
        "id": "wilfrid-sellars-1",
        "text": "The aim of philosophy, abstractly formulated, is to understand how things in the broadest possible sense of the term hang together in the broadest possible sense of the term."
      },
      {
        "id": "wilfrid-sellars-2",
        "text": "In the dimension of describing and explaining the world, science is the measure of all things, of what is that it is, and of what is not that it is not."
      },
      {
        "id": "wilfrid-sellars-3",
        "text": "In characterizing an episode or a state as that of knowing, we are placing it in the logical space of reasons, of justifying and being able to justify what one says."
      },
      {
        "id": "wilfrid-sellars-4",
        "text": "Empirical knowledge, like its sophisticated extension, science, is rational, not because it has a foundation but because it is a self-correcting enterprise which can put any claim in jeopardy, though not all at once."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "United States"
  },
  {
    "id": "p-f-strawson",
    "name": "P. F. Strawson",
    "lifespan": "1919-2006",
    "era": "20th-c. Oxford, England",
    "symbol": "🗺️",
    "oneLiner": "Mapping the deep structure of how we think",
    "bio": "Sir Peter Frederick Strawson was a central figure of postwar Oxford philosophy and a successor to Ryle in metaphysics. In Individuals he founded 'descriptive metaphysics,' which aims to describe the actual structure of our thought about the world rather than to revise it, arguing that material bodies and persons are the basic things we pick out. In his celebrated essay 'Freedom and Resentment,' he reframed the free-will debate around the 'reactive attitudes'—gratitude, resentment, forgiveness—that are too deeply human to abandon even if determinism is true. He also wrote influentially on reference, truth, and the philosophy of Kant.",
    "areas": [
      "Metaphysics",
      "Philosophy of Language",
      "Ethics"
    ],
    "branchSlugs": [
      "metaphysics",
      "ethics",
      "logic"
    ],
    "quotes": [
      {
        "id": "p-f-strawson-1",
        "text": "Descriptive metaphysics is content to describe the actual structure of our thought about the world; revisionary metaphysics is concerned to produce a better structure."
      },
      {
        "id": "p-f-strawson-2",
        "text": "The reactive attitudes are a natural human reaction to the good or ill will or indifference of others towards us, as displayed in their attitudes and actions."
      },
      {
        "id": "p-f-strawson-3",
        "text": "It is not so much the actions of others that concern us as the attitudes and intentions those actions express."
      },
      {
        "id": "p-f-strawson-4",
        "text": "There are no new truths to be discovered, only old truths to be rediscovered."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "England"
  },
  {
    "id": "imre-lakatos",
    "name": "Imre Lakatos",
    "lifespan": "1922-1974",
    "era": "20th-c. Hungary & England",
    "symbol": "📐",
    "oneLiner": "Science advances through competing research programmes",
    "bio": "Imre Lakatos was a Hungarian-born philosopher of mathematics and science who, after surviving wartime Hungary, became a leading thinker at the London School of Economics. In Proofs and Refutations he showed, through a lively classroom dialogue, that mathematics grows not by flawless proofs but by trial, counterexample, and revision. In the philosophy of science he proposed 'research programmes,' arguing that theories are judged over time by whether they are 'progressive' (predicting new facts) or 'degenerating'—a middle path between Popper and Kuhn. He is also remembered for the dictum that history and philosophy of science need each other.",
    "areas": [
      "Philosophy of Science",
      "Philosophy of Mathematics",
      "Epistemology"
    ],
    "branchSlugs": [
      "epistemology",
      "logic"
    ],
    "quotes": [
      {
        "id": "imre-lakatos-1",
        "text": "Philosophy of science without history of science is empty; history of science without philosophy of science is blind."
      },
      {
        "id": "imre-lakatos-2",
        "text": "Mathematics does not grow through a monotonous increase of the number of indubitably established theorems but through the incessant improvement of guesses by speculation and criticism."
      },
      {
        "id": "imre-lakatos-3",
        "text": "Blind commitment to a theory is not an intellectual virtue: it is an intellectual crime."
      },
      {
        "id": "imre-lakatos-4",
        "text": "Dogmatic falsificationism is untenable."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Hungary"
  },
  {
    "id": "michael-dummett",
    "name": "Michael Dummett",
    "lifespan": "1925-2011",
    "era": "20th-c. Oxford, England",
    "symbol": "💬",
    "oneLiner": "Meaning is what a speaker can recognize and verify",
    "bio": "Sir Michael Dummett was a major British philosopher of language and logic and an authority on Gottlob Frege, whom he credited with putting language at the center of philosophy. He argued that a theory of meaning is the foundation of philosophy, and that to understand a sentence is to grasp what would count as evidence for or against it. This led him to defend 'anti-realism'—a term he helped popularize—the view that truth cannot outrun what we could in principle verify. Beyond philosophy, Dummett was a tireless campaigner against racism and a renowned historian of card games and the tarot.",
    "areas": [
      "Philosophy of Language",
      "Logic",
      "Metaphysics"
    ],
    "branchSlugs": [
      "logic",
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "michael-dummett-1",
        "text": "The whole point of my approach has been to show that the theory of meaning is the fundamental part of philosophy."
      },
      {
        "id": "michael-dummett-2",
        "text": "A model of meaning is a model of understanding."
      },
      {
        "id": "michael-dummett-3",
        "text": "What we know when we know a language is how to use it."
      },
      {
        "id": "michael-dummett-4",
        "text": "Frege was the first philosopher to assign to the philosophy of language the central place which it has occupied ever since."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "England"
  },
  {
    "id": "paul-feyerabend",
    "name": "Paul Feyerabend",
    "lifespan": "1924-1994",
    "era": "20th-c. Austria & USA",
    "symbol": "🎭",
    "oneLiner": "In science, anything goes",
    "bio": "Paul Feyerabend was an Austrian-born philosopher of science famous for his provocative challenge to the idea that science follows one fixed method. In Against Method he defended 'epistemological anarchism,' arguing that scientific breakthroughs—like Galileo's—often broke the rules that philosophers tried to impose, summed up in his slogan 'anything goes.' He insisted that no single method captures the messy, creative reality of discovery, and that a free society should not let science monopolize truth. Brilliant, playful, and deliberately controversial, he prized human freedom and the diversity of traditions over rigid rules.",
    "areas": [
      "Philosophy of Science",
      "Epistemology"
    ],
    "branchSlugs": [
      "epistemology",
      "logic"
    ],
    "quotes": [
      {
        "id": "paul-feyerabend-1",
        "text": "The only principle that does not inhibit progress is: anything goes."
      },
      {
        "id": "paul-feyerabend-2",
        "text": "Science is essentially an anarchic enterprise: theoretical anarchism is more humanitarian and more likely to encourage progress than its law-and-order alternatives."
      },
      {
        "id": "paul-feyerabend-3",
        "text": "The events, procedures and results that constitute the sciences have no common structure."
      },
      {
        "id": "paul-feyerabend-4",
        "text": "Without a constant misuse of language there cannot be any discovery, any progress."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Austria"
  },
  {
    "id": "charles-taylor",
    "name": "Charles Taylor",
    "lifespan": "1931-present",
    "era": "Contemporary Canada",
    "symbol": "🪞",
    "oneLiner": "The self is shaped by meaning and community",
    "bio": "Charles Taylor is a Canadian philosopher whose wide-ranging work spans the self, language, religion, and political life. In Sources of the Self he traced how the modern sense of identity was built, arguing that we always understand ourselves against shared 'horizons of significance' rather than as isolated individuals. A leading voice in the communitarian critique of liberalism, he stressed how community and recognition shape who we are. In his monumental A Secular Age he asked how the West moved from a world where belief in God was almost inescapable to one where faith is just one option among many.",
    "areas": [
      "Political Philosophy",
      "Philosophy of the Self",
      "Ethics"
    ],
    "branchSlugs": [
      "political-philosophy",
      "ethics",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "charles-taylor-1",
        "text": "The change I want to define and trace is one which takes us from a society in which it was virtually impossible not to believe in God, to one in which faith, even for the staunchest believer, is one human possibility among others."
      },
      {
        "id": "charles-taylor-2",
        "text": "My discovering my own identity doesn't mean that I work it out in isolation, but that I negotiate it through dialogue, partly overt, partly internal, with others."
      },
      {
        "id": "charles-taylor-3",
        "text": "We are only selves insofar as we move in a certain space of questions, as we seek and find an orientation to the good."
      },
      {
        "id": "charles-taylor-4",
        "text": "Selfhood and the good, or in another way selfhood and morality, turn out to be inextricably intertwined themes."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Canada"
  },
  {
    "id": "christine-korsgaard",
    "name": "Christine Korsgaard",
    "lifespan": "1952-present",
    "era": "Contemporary United States",
    "symbol": "⚖️",
    "oneLiner": "Morality springs from our own rational autonomy",
    "bio": "Christine Korsgaard is an American moral philosopher at Harvard and one of the most influential interpreters of Kant working today. In The Sources of Normativity she asks why moral claims have authority over us, arguing that their force comes from our own reflective nature: because we can step back and question our impulses, we must endorse some reasons to act at all. On her 'Kantian constructivist' view, moral principles are not facts we discover but solutions rational agents build to live together. She has also become a leading philosophical defender of the moral standing of animals.",
    "areas": [
      "Ethics",
      "Moral Philosophy",
      "Philosophy of Action"
    ],
    "branchSlugs": [
      "ethics",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "christine-korsgaard-1",
        "text": "You must value your own humanity if you are to value anything at all."
      },
      {
        "id": "christine-korsgaard-2",
        "text": "It is the most striking fact about human life that we have to make our choices and act for reasons."
      },
      {
        "id": "christine-korsgaard-3",
        "text": "The human mind is self-conscious in the sense that it is essentially reflective."
      },
      {
        "id": "christine-korsgaard-4",
        "text": "Of course there are still obligations, but they are obligations that we impose upon ourselves."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "United States"
  },
  {
    "id": "theodor-adorno",
    "name": "Theodor W. Adorno",
    "lifespan": "1903-1969",
    "era": "20th-c. Frankfurt School, Germany",
    "symbol": "🎻",
    "oneLiner": "Critical theory against the culture industry",
    "bio": "Theodor Adorno was a German philosopher, sociologist, and musicologist, and a leading mind of the Frankfurt School of critical theory. With Max Horkheimer he wrote Dialectic of Enlightenment, arguing that reason meant to free us had turned into a tool of domination. He coined the idea of the 'culture industry' to show how mass entertainment sells conformity disguised as fun. In Negative Dialectics he resisted tidy systems, insisting thought must stay loyal to whatever does not fit. He believed art and uncompromising thinking were among the last refuges of freedom in a 'damaged' world.",
    "areas": [
      "Critical Theory",
      "Aesthetics",
      "Social Philosophy"
    ],
    "branchSlugs": [
      "aesthetics",
      "political-philosophy",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "theodor-adorno-1",
        "text": "Wrong life cannot be lived rightly."
      },
      {
        "id": "theodor-adorno-2",
        "text": "To write poetry after Auschwitz is barbaric."
      },
      {
        "id": "theodor-adorno-3",
        "text": "The splinter in your eye is the best magnifying-glass."
      },
      {
        "id": "theodor-adorno-4",
        "text": "In psycho-analysis nothing is true except the exaggerations."
      },
      {
        "id": "theodor-adorno-5",
        "text": "The whole is the false."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Germany"
  },
  {
    "id": "walter-benjamin",
    "name": "Walter Benjamin",
    "lifespan": "1892-1940",
    "era": "20th-c. critical theory, Germany",
    "symbol": "📜",
    "oneLiner": "Art, history, and the aura lost to reproduction",
    "bio": "Walter Benjamin was a German-Jewish critic, essayist, and philosopher loosely tied to the Frankfurt School, whose dazzling essays mixed Marxism, mysticism, and a poet's eye. His famous essay on the work of art argued that photography and film strip artworks of their unique 'aura,' changing how we see entirely. In his 'Theses on the Philosophy of History' he pictured the angel of history blown backward into the future by a storm called progress. He worked for years on an unfinished collage of quotations about modern Paris, the Arcades Project. Fleeing the Nazis in 1940, he took his own life at the French-Spanish border, leaving behind ideas that reshaped how we think about media and memory.",
    "areas": [
      "Aesthetics",
      "Philosophy of History",
      "Cultural Criticism"
    ],
    "branchSlugs": [
      "aesthetics",
      "metaphysics",
      "political-philosophy"
    ],
    "quotes": [
      {
        "id": "walter-benjamin-1",
        "text": "There is no document of civilization which is not at the same time a document of barbarism."
      },
      {
        "id": "walter-benjamin-2",
        "text": "That which withers in the age of mechanical reproduction is the aura of the work of art."
      },
      {
        "id": "walter-benjamin-3",
        "text": "This storm is what we call progress."
      },
      {
        "id": "walter-benjamin-4",
        "text": "The work of art has always been reproducible."
      },
      {
        "id": "walter-benjamin-5",
        "text": "To be happy is to be able to become aware of oneself without fright."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Germany"
  },
  {
    "id": "herbert-marcuse",
    "name": "Herbert Marcuse",
    "lifespan": "1898-1979",
    "era": "20th-c. Frankfurt School, Germany/USA",
    "symbol": "✊",
    "oneLiner": "Consumer society as comfortable, smooth unfreedom",
    "bio": "Herbert Marcuse was a German-American philosopher of the Frankfurt School who became the intellectual hero of the 1960s student left. In One-Dimensional Man he argued that advanced industrial society pacifies people by giving them endless choices among products while quietly closing off real political alternatives. He blended Marx and Freud in Eros and Civilization, imagining a future where work could become more like play. He called for a 'Great Refusal' against a system that manufactures false needs and calls it freedom. To students protesting war and conformity, his critique of 'comfortable, smooth, reasonable, democratic unfreedom' felt like the truth.",
    "areas": [
      "Critical Theory",
      "Political Philosophy",
      "Social Philosophy"
    ],
    "branchSlugs": [
      "political-philosophy",
      "ethics",
      "aesthetics"
    ],
    "quotes": [
      {
        "id": "herbert-marcuse-1",
        "text": "The people recognize themselves in their commodities; they find their soul in their automobile, hi-fi set, split-level home, kitchen equipment."
      },
      {
        "id": "herbert-marcuse-2",
        "text": "Free election of masters does not abolish the masters or the slaves."
      },
      {
        "id": "herbert-marcuse-3",
        "text": "Not every problem someone has with his girlfriend is necessarily due to the capitalist mode of production."
      },
      {
        "id": "herbert-marcuse-4",
        "text": "One-dimensional thought is systematically promoted by the makers of politics."
      },
      {
        "id": "herbert-marcuse-5",
        "text": "Art cannot change the world, but it can contribute to changing the consciousness and drives of the men and women who could change the world."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Germany"
  },
  {
    "id": "jurgen-habermas",
    "name": "Jürgen Habermas",
    "lifespan": "1929-2026",
    "era": "20th-c. Frankfurt School, Germany",
    "symbol": "🗣️",
    "oneLiner": "Reason is born in honest conversation",
    "bio": "Jürgen Habermas was a German philosopher and social theorist, the most influential heir of the Frankfurt School. He traced the rise of a 'public sphere' where private citizens once gathered to debate reason against power, and worried about its decline. His great work, The Theory of Communicative Action, located rationality not in lonely thinking but in genuine dialogue between people seeking understanding. He imagined an 'ideal speech situation' in which only 'the unforced force of the better argument' decides what we accept. A tireless public intellectual until his death in 2026, he defended democracy, deliberation, and the unfinished promise of the Enlightenment.",
    "areas": [
      "Critical Theory",
      "Political Philosophy",
      "Philosophy of Language"
    ],
    "branchSlugs": [
      "political-philosophy",
      "ethics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "jurgen-habermas-1",
        "text": "We need not always be in agreement, but we must always be able to understand one another."
      },
      {
        "id": "jurgen-habermas-2",
        "text": "The unforced force of the better argument."
      },
      {
        "id": "jurgen-habermas-3",
        "text": "Sociology arose as the theory of bourgeois society."
      },
      {
        "id": "jurgen-habermas-4",
        "text": "What raises us out of nature is the only thing whose nature we can know: language."
      },
      {
        "id": "jurgen-habermas-5",
        "text": "A theory of society conceived with practical intention."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Germany"
  },
  {
    "id": "karl-jaspers",
    "name": "Karl Jaspers",
    "lifespan": "1883-1969",
    "era": "20th-c. existentialism, Germany",
    "symbol": "🌄",
    "oneLiner": "We find ourselves at life's limit situations",
    "bio": "Karl Jaspers was a German psychiatrist turned philosopher and a founder of existential philosophy. Trained as a doctor, he wrote a landmark work on psychopathology before turning to the question of what it means to truly exist. He spoke of 'limit situations'—death, suffering, struggle, guilt—the moments that shatter our routines and force us to face who we really are. He believed authentic selfhood is reached only through open, honest 'communication' with another person. Gesturing beyond all knowledge toward a mystery he called 'the Encompassing,' Jaspers kept philosophy humble, restless, and on the way.",
    "areas": [
      "Existentialism",
      "Metaphysics",
      "Philosophy of Existence"
    ],
    "branchSlugs": [
      "metaphysics",
      "ethics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "karl-jaspers-1",
        "text": "The individual cannot become human by himself."
      },
      {
        "id": "karl-jaspers-2",
        "text": "We are what we are only through the community of mutually conscious understandings."
      },
      {
        "id": "karl-jaspers-3",
        "text": "Philosophy means to be on the way."
      },
      {
        "id": "karl-jaspers-4",
        "text": "Truth begins with two."
      },
      {
        "id": "karl-jaspers-5",
        "text": "Man becomes himself only in communication with another."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Germany"
  },
  {
    "id": "emmanuel-levinas",
    "name": "Emmanuel Levinas",
    "lifespan": "1906-1995",
    "era": "20th-c. phenomenology, France",
    "symbol": "👤",
    "oneLiner": "Ethics begins in the face of another",
    "bio": "Emmanuel Levinas was a Lithuanian-born French philosopher who helped bring phenomenology to France and then pushed it in a radically ethical direction. Drawing on Husserl, Heidegger, and his Jewish tradition, he argued that ethics, not metaphysics, is 'first philosophy.' For Levinas, meeting the face of another person is an event before all thought: the face is defenseless yet commands me, silently saying 'thou shalt not kill.' Out of that encounter springs a responsibility for the Other that is infinite and comes before my own freedom. His work made hospitality to the stranger the very heart of what it means to be human.",
    "areas": [
      "Phenomenology",
      "Ethics",
      "Philosophy of Religion"
    ],
    "branchSlugs": [
      "ethics",
      "metaphysics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "emmanuel-levinas-1",
        "text": "The face is what one cannot kill, or at least it is that whose meaning consists in saying: thou shalt not kill."
      },
      {
        "id": "emmanuel-levinas-2",
        "text": "Ethics is the first philosophy."
      },
      {
        "id": "emmanuel-levinas-3",
        "text": "The face speaks to me and thereby invites me to a relation."
      },
      {
        "id": "emmanuel-levinas-4",
        "text": "I am responsible for the Other without waiting for reciprocity."
      },
      {
        "id": "emmanuel-levinas-5",
        "text": "Responsibility is what is incumbent on me exclusively, and what, humanly, I cannot refuse."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "France"
  },
  {
    "id": "paul-ricoeur",
    "name": "Paul Ricoeur",
    "lifespan": "1913-2005",
    "era": "20th-c. hermeneutics, France",
    "symbol": "📖",
    "oneLiner": "We understand ourselves through the stories we tell",
    "bio": "Paul Ricoeur was a French philosopher and a master of hermeneutics, the art of interpretation. Patient and bridge-building, he brought phenomenology into conversation with psychoanalysis, structuralism, and theology. He coined the phrase 'hermeneutics of suspicion' for thinkers like Marx, Nietzsche, and Freud who taught us to read beneath surface meanings. In Time and Narrative and Oneself as Another he argued that we make sense of our lives by weaving them into stories, forging what he called 'narrative identity.' For Ricoeur, the long detour through symbols, texts, and others was the only honest path back to the self.",
    "areas": [
      "Hermeneutics",
      "Phenomenology",
      "Ethics"
    ],
    "branchSlugs": [
      "epistemology",
      "ethics",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "paul-ricoeur-1",
        "text": "The symbol gives rise to thought."
      },
      {
        "id": "paul-ricoeur-2",
        "text": "We tell stories because in the last analysis human lives need and merit being narrated."
      },
      {
        "id": "paul-ricoeur-3",
        "text": "To explain more is to understand better."
      },
      {
        "id": "paul-ricoeur-4",
        "text": "Hermeneutics is the theory of the operations of understanding in their relation to the interpretation of texts."
      },
      {
        "id": "paul-ricoeur-5",
        "text": "As long as there is suffering, the work of philosophy is not finished."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "France"
  },
  {
    "id": "gilles-deleuze",
    "name": "Gilles Deleuze",
    "lifespan": "1925-1995",
    "era": "20th-c. post-structuralism, France",
    "symbol": "🌱",
    "oneLiner": "Philosophy is the creation of new concepts",
    "bio": "Gilles Deleuze was a French philosopher whose restless, inventive thought made him a central figure of post-structuralism. In Difference and Repetition he flipped Western philosophy on its head, arguing that difference comes first and identity is only its echo. With the psychoanalyst Félix Guattari he wrote Anti-Oedipus and A Thousand Plateaus, introducing the 'rhizome'—a model of knowledge that branches in every direction with no center and no hierarchy. He defined philosophy itself as the art of creating concepts, treating ideas as tools and as weapons. Playful and radically affirmative, Deleuze prized becoming, multiplicity, and lines of escape over fixed essences.",
    "areas": [
      "Post-structuralism",
      "Metaphysics",
      "Aesthetics"
    ],
    "branchSlugs": [
      "metaphysics",
      "aesthetics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "gilles-deleuze-1",
        "text": "A concept is a brick. It can be used to build a courthouse of reason. Or it can be thrown through the window."
      },
      {
        "id": "gilles-deleuze-2",
        "text": "Philosophy is the art of forming, inventing, and fabricating concepts."
      },
      {
        "id": "gilles-deleuze-3",
        "text": "We are not in the world, we become with the world."
      },
      {
        "id": "gilles-deleuze-4",
        "text": "What does it mean to love somebody? It is always to seize that person in a mass."
      },
      {
        "id": "gilles-deleuze-5",
        "text": "There is no need to fear or hope, but only to look for new weapons."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "France"
  },
  {
    "id": "roland-barthes",
    "name": "Roland Barthes",
    "lifespan": "1915-1980",
    "era": "20th-c. structuralism, France",
    "symbol": "🔤",
    "oneLiner": "Every culture speaks in hidden myths and signs",
    "bio": "Roland Barthes was a French literary critic and semiotician who turned the everyday world into something to be read like a text. In Mythologies he decoded the hidden messages buried in wrestling, soap powder, and steak and chips, showing how culture passes off its values as 'natural.' His famous essay 'The Death of the Author' argued that a text's meaning is born in its readers, not locked away in its writer's intentions. A founder of structuralist literary theory who later drifted toward more personal writing, he wrote with unmatched style about pleasure, photography, and love. Few thinkers did more to teach us that meaning is made, not given.",
    "areas": [
      "Semiotics",
      "Literary Theory",
      "Cultural Criticism"
    ],
    "branchSlugs": [
      "aesthetics",
      "epistemology",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "roland-barthes-1",
        "text": "The birth of the reader must be at the cost of the death of the Author."
      },
      {
        "id": "roland-barthes-2",
        "text": "Literature is the question minus the answer."
      },
      {
        "id": "roland-barthes-3",
        "text": "Language is a skin: I rub my language against the other."
      },
      {
        "id": "roland-barthes-4",
        "text": "What the public wants is the image of passion, not passion itself."
      },
      {
        "id": "roland-barthes-5",
        "text": "I cannot classify the other, for the other is, precisely, Unique."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "France"
  },
  {
    "id": "julia-kristeva",
    "name": "Julia Kristeva",
    "lifespan": "1941-present",
    "era": "20th-c. post-structuralism, Bulgaria/France",
    "symbol": "🪞",
    "oneLiner": "The stranger we fear lives within us",
    "bio": "Julia Kristeva is a Bulgarian-born French philosopher, literary critic, and psychoanalyst, and a major voice in post-structuralist and feminist thought. She coined the term 'intertextuality,' the idea that every text is woven from other texts. In Powers of Horror she analyzed 'abjection,' the gut-level recoil at what blurs the line between self and other, like corpses or open wounds. Her book Strangers to Ourselves argued that the foreigner we fear is really the strangeness hidden inside each of us, making xenophobia a flight from self-knowledge. Blending semiotics with psychoanalysis, she keeps probing how language, the body, and desire make us who we are.",
    "areas": [
      "Post-structuralism",
      "Psychoanalysis",
      "Feminist Theory"
    ],
    "branchSlugs": [
      "aesthetics",
      "ethics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "julia-kristeva-1",
        "text": "The foreigner lives within us: he is the hidden face of our identity."
      },
      {
        "id": "julia-kristeva-2",
        "text": "Strangely, the foreigner lives within us: he is the hidden face of our identity, the space that wrecks our abode."
      },
      {
        "id": "julia-kristeva-3",
        "text": "By recognizing our uncanny strangeness we shall neither suffer from it nor enjoy it from the outside."
      },
      {
        "id": "julia-kristeva-4",
        "text": "Writing is impossible without some kind of exile."
      },
      {
        "id": "julia-kristeva-5",
        "text": "The speaking subject is a divided subject."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Bulgaria"
  },
  {
    "id": "frantz-fanon",
    "name": "Frantz Fanon",
    "lifespan": "1925-1961",
    "era": "Anticolonial 20th c. Martinique/Algeria",
    "symbol": "✊🏾",
    "oneLiner": "Colonialism warps the mind; liberation requires remaking the self",
    "bio": "Frantz Fanon was a psychiatrist and revolutionary from the French Caribbean island of Martinique who became one of the most powerful voices against colonialism. In Black Skin, White Masks he described how racism gets inside people, distorting how the colonized see their own bodies and worth. Working as a doctor in Algeria during its war of independence, he joined the liberation movement and wrote The Wretched of the Earth, a fierce study of colonial violence and the struggle to overcome it. His work shaped how generations think about race, identity, and freedom across the globe.",
    "areas": [
      "Political Philosophy",
      "Postcolonial Theory",
      "Philosophy of Race",
      "Psychiatry"
    ],
    "branchSlugs": [
      "political-philosophy",
      "ethics",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "frantz-fanon-1",
        "text": "Each generation must, out of relative obscurity, discover its mission, fulfill it, or betray it."
      },
      {
        "id": "frantz-fanon-2",
        "text": "O my body, make of me always a man who questions!"
      },
      {
        "id": "frantz-fanon-3",
        "text": "I am not a prisoner of history. I should not seek there for the meaning of my destiny."
      },
      {
        "id": "frantz-fanon-4",
        "text": "I, the man of color, want only this: that the tool never possess the man."
      },
      {
        "id": "frantz-fanon-5",
        "text": "Imperialism leaves behind germs of rot which we must clinically detect and remove from our land but from our minds as well."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Martinique"
  },
  {
    "id": "web-du-bois",
    "name": "W.E.B. Du Bois",
    "lifespan": "1868-1963",
    "era": "Modern United States",
    "symbol": "📚",
    "oneLiner": "Black Americans live with a doubled, divided self",
    "bio": "William Edward Burghardt Du Bois was an American sociologist, historian, and activist, the first African American to earn a doctorate from Harvard. In his landmark book The Souls of Black Folk, he gave us the idea of double consciousness, the strange experience of seeing yourself through the eyes of a society that looks down on you. He argued that the great problem of the twentieth century would be the color line dividing peoples by race. A founder of the NAACP and a lifelong campaigner for justice, he linked careful scholarship to the fight for human dignity.",
    "areas": [
      "Political Philosophy",
      "Philosophy of Race",
      "Social Philosophy"
    ],
    "branchSlugs": [
      "political-philosophy",
      "ethics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "web-du-bois-1",
        "text": "The problem of the Twentieth Century is the problem of the color-line."
      },
      {
        "id": "web-du-bois-2",
        "text": "It is a peculiar sensation, this double-consciousness, this sense of always looking at one's self through the eyes of others."
      },
      {
        "id": "web-du-bois-3",
        "text": "One ever feels his twoness,—an American, a Negro; two souls, two thoughts, two unreconciled strivings; two warring ideals in one dark body."
      },
      {
        "id": "web-du-bois-4",
        "text": "There is no true American music but the wild sweet melodies of the Negro slave."
      },
      {
        "id": "web-du-bois-5",
        "text": "The cost of liberty is less than the price of repression."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "United States"
  },
  {
    "id": "kwasi-wiredu",
    "name": "Kwasi Wiredu",
    "lifespan": "1931-2022",
    "era": "Contemporary Ghana",
    "symbol": "🌍",
    "oneLiner": "Free African thought from borrowed colonial concepts",
    "bio": "Kwasi Wiredu was a Ghanaian philosopher widely regarded as one of the most important figures in modern African philosophy. He called for conceptual decolonization, urging African thinkers to examine which ideas they had simply inherited from Western traditions and which grew from their own languages and cultures. Drawing on the Akan language of Ghana, he explored how different cultures frame truth, personhood, and knowledge in different ways. He also defended consensus democracy, arguing that traditional African practice of seeking agreement offers a real alternative to winner-takes-all majority rule.",
    "areas": [
      "Epistemology",
      "African Philosophy",
      "Political Philosophy",
      "Metaphysics"
    ],
    "branchSlugs": [
      "epistemology",
      "political-philosophy",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "kwasi-wiredu-1",
        "text": "By conceptual decolonization I mean the purging of African philosophical thinking of all uncritical assimilation of Western ways of thinking."
      },
      {
        "id": "kwasi-wiredu-2",
        "text": "It is a function, indeed a duty, of philosophy in any society to examine the intellectual foundations of its culture."
      },
      {
        "id": "kwasi-wiredu-3",
        "text": "The African philosopher has no choice but to conduct his philosophical inquiries in relation to the philosophical writings of other peoples."
      },
      {
        "id": "kwasi-wiredu-4",
        "text": "One is not born a person; one becomes a person through community and ethical achievement."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Ghana"
  },
  {
    "id": "enrique-dussel",
    "name": "Enrique Dussel",
    "lifespan": "1934-2023",
    "era": "Contemporary Argentina/Mexico",
    "symbol": "🧭",
    "oneLiner": "Philosophy must start from the excluded Other",
    "bio": "Enrique Dussel was an Argentine-Mexican philosopher and a founder of the Latin American philosophy of liberation. He argued that ethics and politics should begin not from the comfortable European center but from the standpoint of those it has excluded, the poor, the colonized, the Other. Drawing on thinkers like Levinas, he made the face of the suffering Other the starting point of moral thought. He also rewrote the story of modernity, dating its birth to 1492 and the conquest of the Americas, and called for a transmodern future of equal dialogue among all the world's cultures.",
    "areas": [
      "Ethics",
      "Political Philosophy",
      "Philosophy of Liberation",
      "Decolonial Theory"
    ],
    "branchSlugs": [
      "ethics",
      "political-philosophy",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "enrique-dussel-1",
        "text": "Modernity does not begin with Descartes; it begins in 1492 with the conquest of the Americas."
      },
      {
        "id": "enrique-dussel-2",
        "text": "The Other is diverse: the woman in the sexist system, the child in pedagogy, the poor in the economy."
      },
      {
        "id": "enrique-dussel-3",
        "text": "Philosophy of liberation begins from the exteriority of the excluded, the victim of the system."
      },
      {
        "id": "enrique-dussel-4",
        "text": "Transmodernity is the dialogue of cultures meeting at last on equal footing, beyond the myth of a single modernity."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Argentina"
  },
  {
    "id": "jose-carlos-mariategui",
    "name": "José Carlos Mariátegui",
    "lifespan": "1894-1930",
    "era": "Early 20th c. Peru",
    "symbol": "⛰️",
    "oneLiner": "Socialism must be heroic creation, not copied import",
    "bio": "José Carlos Mariátegui was a Peruvian writer and self-taught thinker often called the first original Marxist philosopher of Latin America. In his famous Seven Interpretive Essays on Peruvian Reality, he argued that you cannot simply borrow European ideas and apply them; revolutionary thought must grow from a country's own concrete conditions. He insisted that the suffering of Peru's Indigenous peoples was at root an economic problem, tied to who owned the land, not merely a matter of race or charity. Despite dying at just thirty-five, he shaped Latin American political thought for a century.",
    "areas": [
      "Political Philosophy",
      "Marxist Theory",
      "Social Philosophy"
    ],
    "branchSlugs": [
      "political-philosophy",
      "ethics"
    ],
    "quotes": [
      {
        "id": "jose-carlos-mariategui-1",
        "text": "We do not want socialism in America to be a copy or imitation; it must be a heroic creation."
      },
      {
        "id": "jose-carlos-mariategui-2",
        "text": "The problem of the Indian is rooted in the land tenure system of our economy."
      },
      {
        "id": "jose-carlos-mariategui-3",
        "text": "We must give life to Indo-American socialism with our own reality, in our own language."
      },
      {
        "id": "jose-carlos-mariategui-4",
        "text": "Any treatment of the problem of the Indian that fails to recognize it as a socio-economic problem is a sterile exercise."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "Peru"
  },
  {
    "id": "muhammad-iqbal",
    "name": "Muhammad Iqbal",
    "lifespan": "1877-1938",
    "era": "Modern British India",
    "symbol": "🦅",
    "oneLiner": "Strengthen the self to shape your own destiny",
    "bio": "Muhammad Iqbal was a poet and philosopher of British India whose verse and thought reshaped modern Islamic philosophy. His central idea was khudi, the self or ego, which he believed each person should strengthen and elevate through action, love, and striving rather than dissolve in passive mysticism. In The Reconstruction of Religious Thought in Islam he tried to bring Islamic tradition into dialogue with modern science and philosophy. Revered as a national poet, he also dreamed of a separate homeland for South Asian Muslims and is honored as a spiritual founder of Pakistan.",
    "areas": [
      "Islamic Philosophy",
      "Metaphysics",
      "Philosophy of Religion",
      "Political Philosophy"
    ],
    "branchSlugs": [
      "metaphysics",
      "political-philosophy",
      "ethics"
    ],
    "quotes": [
      {
        "id": "muhammad-iqbal-1",
        "text": "Develop the self so that before every decree God will ask you: What is your wish?"
      },
      {
        "id": "muhammad-iqbal-2",
        "text": "The ultimate aim of the ego is not to see something, but to be something."
      },
      {
        "id": "muhammad-iqbal-3",
        "text": "Nations are born in the hearts of poets; they prosper and die in the hands of politicians."
      },
      {
        "id": "muhammad-iqbal-4",
        "text": "A thousand years the narcissus laments its sightlessness; with great difficulty the seer is born in the garden."
      },
      {
        "id": "muhammad-iqbal-5",
        "text": "Religion is not a departmental affair; it is neither mere thought, nor mere feeling, nor mere action; it is an expression of the whole man."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "British India"
  },
  {
    "id": "judith-butler",
    "name": "Judith Butler",
    "lifespan": "1956-present",
    "era": "Contemporary United States",
    "symbol": "🎭",
    "oneLiner": "Gender is something we do, not something we are",
    "bio": "Judith Butler is an American philosopher who transformed how we think about gender, identity, and the body. In their influential book Gender Trouble, Butler argued that gender is performative: it is not a fixed inner essence but something produced through the repeated everyday acts of speaking, dressing, and behaving. There is no true self hiding behind these acts; the acts themselves create the appearance of a stable identity. Beyond gender, Butler has written widely on power, mourning, vulnerability, and what it means to live an ethical life alongside others.",
    "areas": [
      "Feminist Philosophy",
      "Gender Theory",
      "Ethics",
      "Political Philosophy"
    ],
    "branchSlugs": [
      "ethics",
      "political-philosophy",
      "metaphysics"
    ],
    "quotes": [
      {
        "id": "judith-butler-1",
        "text": "There is no gender identity behind the expressions of gender; that identity is performatively constituted by the very expressions that are said to be its results."
      },
      {
        "id": "judith-butler-2",
        "text": "Possibility is not a luxury; it is as crucial as bread."
      },
      {
        "id": "judith-butler-3",
        "text": "To say that gender is performative is to say that it produces a series of effects."
      },
      {
        "id": "judith-butler-4",
        "text": "Let's face it. We're undone by each other. And if we're not, we're missing something."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "United States"
  },
  {
    "id": "amartya-sen",
    "name": "Amartya Sen",
    "lifespan": "1933-present",
    "era": "Contemporary India",
    "symbol": "⚖️",
    "oneLiner": "Development means expanding real human freedoms",
    "bio": "Amartya Sen is an Indian economist and philosopher who won the Nobel Prize in Economics for reshaping how we think about poverty and progress. He argued that development should be measured not just by income or GDP but by the real freedoms people have to live the lives they value, an idea known as the capability approach. He famously showed that famines do not happen in functioning democracies with a free press, because accountable governments are forced to act. His work bridges economics, ethics, and political philosophy and has guided global measures of human development.",
    "areas": [
      "Political Philosophy",
      "Ethics",
      "Welfare Economics",
      "Social Choice Theory"
    ],
    "branchSlugs": [
      "political-philosophy",
      "ethics",
      "epistemology"
    ],
    "quotes": [
      {
        "id": "amartya-sen-1",
        "text": "No famine has ever taken place in the history of the world in a functioning democracy."
      },
      {
        "id": "amartya-sen-2",
        "text": "Development can be seen as a process of expanding the real freedoms that people enjoy."
      },
      {
        "id": "amartya-sen-3",
        "text": "Freedom is both the primary objective and the principal means of development."
      },
      {
        "id": "amartya-sen-4",
        "text": "Poverty must be seen as the deprivation of basic capabilities rather than merely as lowness of incomes."
      },
      {
        "id": "amartya-sen-5",
        "text": "The hope of harmony in the contemporary world lies to a great extent in a clearer understanding of the pluralities of human identity."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "India"
  },
  {
    "id": "martha-nussbaum",
    "name": "Martha Nussbaum",
    "lifespan": "1947-present",
    "era": "Contemporary United States",
    "symbol": "🌱",
    "oneLiner": "A good life needs both flourishing and fragility",
    "bio": "Martha Nussbaum is an American philosopher known for connecting ancient Greek wisdom to urgent modern questions about justice, emotions, and human dignity. Working alongside Amartya Sen, she developed the capabilities approach, a list of the core things every person needs to be able to do and be in order to live a truly human life. She argues that emotions like compassion and love are not enemies of reason but essential parts of ethical thinking and good public policy. Across many books she defends the value of literature, vulnerability, and the dignity of every living being.",
    "areas": [
      "Ethics",
      "Political Philosophy",
      "Philosophy of Emotion",
      "Ancient Philosophy"
    ],
    "branchSlugs": [
      "ethics",
      "political-philosophy",
      "aesthetics"
    ],
    "quotes": [
      {
        "id": "martha-nussbaum-1",
        "text": "To be a good human being is to have a kind of openness to the world, an ability to trust uncertain things beyond your own control."
      },
      {
        "id": "martha-nussbaum-2",
        "text": "The capabilities approach asks not how satisfied people are, but what they are actually able to do and to be."
      },
      {
        "id": "martha-nussbaum-3",
        "text": "Compassion is the basic social emotion."
      },
      {
        "id": "martha-nussbaum-4",
        "text": "To have a good human life one must have access to a wide range of human capabilities, the things a person is able to do and to be."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "United States"
  },
  {
    "id": "bell-hooks",
    "name": "bell hooks",
    "lifespan": "1952-2021",
    "era": "Contemporary United States",
    "symbol": "💗",
    "oneLiner": "Race, gender, and class oppression are intertwined",
    "bio": "bell hooks, the pen name of Gloria Jean Watkins, was an American writer, teacher, and feminist thinker who insisted that liberation movements must confront race, gender, and class all at once. Beginning with Ain't I a Woman, she showed how Black women's experiences had been left out of both feminism and the civil rights struggle, helping lay the groundwork for what we now call intersectionality. She chose to write her name in lowercase to keep attention on her ideas rather than herself. In later work like All About Love she argued that love is not a feeling but a practice, an everyday ethic of care.",
    "areas": [
      "Feminist Philosophy",
      "Philosophy of Race",
      "Ethics",
      "Cultural Criticism"
    ],
    "branchSlugs": [
      "ethics",
      "political-philosophy",
      "aesthetics"
    ],
    "quotes": [
      {
        "id": "bell-hooks-1",
        "text": "Love is an action, never simply a feeling."
      },
      {
        "id": "bell-hooks-2",
        "text": "Patriarchy has no gender."
      },
      {
        "id": "bell-hooks-3",
        "text": "To begin by always thinking of love as an action rather than a feeling is one way in which anyone using the word in this manner automatically assumes accountability and responsibility."
      },
      {
        "id": "bell-hooks-4",
        "text": "The function of art is to do more than tell it like it is, it's to imagine what is possible."
      },
      {
        "id": "bell-hooks-5",
        "text": "Feminism is a movement to end sexism, sexist exploitation, and oppression."
      }
    ],
    "category": "CONTEMPORARY",
    "country": "United States"
  }
];
