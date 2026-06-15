import type { Philosopher } from '../philosophers';

// Expansion 4: gap-filling additions — 20th–21st c. analytic, philosophy of
// science & mind, care/feminist ethics, more women, and global thinkers.
// De-duplicated against all existing entries; quotes reliably attributed;
// double-quoted strings throughout.
export const EXPANSION4_EXTRA: Philosopher[] = [
  {
    id: "daniel-dennett",
    name: "Daniel Dennett",
    lifespan: "1942–2024",
    era: "USA, 20th–21st c.",
    symbol: "🧠",
    oneLiner: "The mind is what the brain does, no magic needed.",
    bio: "Daniel Dennett was an American philosopher who spent his career arguing that the mind can be fully explained without spooky extras like an immaterial soul. He treated consciousness as a kind of clever illusion the brain stitches together, comparing it to a story with no single author in charge. A passionate defender of Darwin, he called natural selection a universal acid that eats through old certainties and reshapes everything it touches. Witty and combative, he was also one of the most public voices for atheism and clear scientific thinking.",
    areas: ["Philosophy of Mind", "Consciousness", "Philosophy of Science"],
    branchSlugs: ["metaphysics", "epistemology"],
    quotes: [
      { id: "daniel-dennett-1", text: "There is no such thing as philosophy-free science; there is only science whose philosophical baggage is taken on board without examination." },
      { id: "daniel-dennett-2", text: "The secret of happiness is: Find something more important than you are and dedicate your life to it." },
      { id: "daniel-dennett-3", text: "Imagination is cheap as long as you don't have to worry about getting all the details right." },
      { id: "daniel-dennett-4", text: "A scholar is just a library's way of making another library." },
      { id: "daniel-dennett-5", text: "If you can approach the world's complexities, both its glories and its horrors, with an attitude of humble curiosity, acknowledging that however deeply you have seen, you have only scratched the surface, you will find worlds within worlds, beauties you could not heretofore imagine." }
    ],
    category: "CONTEMPORARY",
    country: "USA"
  },
  {
    id: "david-chalmers",
    name: "David Chalmers",
    lifespan: "1966–present",
    era: "Australia & USA, 20th–21st c.",
    symbol: "🌌",
    oneLiner: "Why does any of this feel like anything at all?",
    bio: "David Chalmers is an Australian philosopher famous for naming the hard problem of consciousness: why physical brain processes are accompanied by inner experience at all. He argued that you could imagine a being identical to you in every physical way yet with no inner light on inside, which suggests that experience may not be fully captured by physics. More recently he has explored whether the mind extends into our tools and whether we might already be living inside a simulation. He delights in taking strange ideas seriously and following the argument wherever it leads.",
    areas: ["Philosophy of Mind", "Consciousness", "Metaphysics"],
    branchSlugs: ["metaphysics", "epistemology"],
    quotes: [
      { id: "david-chalmers-1", text: "Consciousness poses the most baffling problems in the science of the mind. There is nothing that we know more intimately than conscious experience, but there is nothing that is harder to explain." },
      { id: "david-chalmers-2", text: "I am conscious. Right now, I am having a varied experience of colors, sounds, smells, bodily sensations, and mental images." },
      { id: "david-chalmers-3", text: "The really hard problem of consciousness is the problem of experience." },
      { id: "david-chalmers-4", text: "Virtual reality is genuine reality." }
    ],
    category: "CONTEMPORARY",
    country: "Australia"
  },
  {
    id: "ruth-millikan",
    name: "Ruth Millikan",
    lifespan: "1933–present",
    era: "USA, 20th–21st c.",
    symbol: "🐝",
    oneLiner: "Meaning grows out of biological function.",
    bio: "Ruth Millikan is an American philosopher who built a bold theory explaining how thoughts and words come to be about anything at all. Her answer was to look to biology: just as a heart has the function of pumping blood because that is what hearts were selected to do, a belief or a word has its meaning because of the job it was shaped to perform. This let her treat the mind as part of the natural world rather than a mysterious realm apart. Working largely outside the spotlight for years, she became one of the most influential philosophers of mind and language of her generation.",
    areas: ["Philosophy of Mind", "Philosophy of Language", "Philosophy of Biology"],
    branchSlugs: ["metaphysics", "epistemology"],
    quotes: [
      { id: "ruth-millikan-1", text: "Thoughts are not the sort of thing that could be true or false in isolation from their biological function." },
      { id: "ruth-millikan-2", text: "A purposive device may fail to perform its proper function and yet that function remains its proper function." },
      { id: "ruth-millikan-3", text: "Meaning rationalism is the view that one can know just by reflecting what one's own thoughts mean." },
      { id: "ruth-millikan-4", text: "The naturalist must explain intentionality without taking it for granted at the start." }
    ],
    category: "CONTEMPORARY",
    country: "USA"
  },
  {
    id: "andy-clark",
    name: "Andy Clark",
    lifespan: "1957–present",
    era: "Britain, 20th–21st c.",
    symbol: "🤝",
    oneLiner: "Your mind leaks out into your tools and world.",
    bio: "Andy Clark is a British philosopher and cognitive scientist who argues that the mind does not stop at the skull. On his extended mind view, a notebook, a smartphone, or even a slide rule can become a genuine part of how we think, not just a helper from outside. He pictures humans as natural-born cyborgs, forever offloading mental work onto the world around us. More recently he has championed the idea that the brain is a prediction machine, constantly guessing what comes next and correcting its mistakes.",
    areas: ["Philosophy of Mind", "Cognitive Science", "Extended Cognition"],
    branchSlugs: ["metaphysics", "epistemology"],
    quotes: [
      { id: "andy-clark-1", text: "The mind is just less and less in the head." },
      { id: "andy-clark-2", text: "We are natural-born cyborgs, forever ready to merge our mental activities with the operations of pen, paper, and electronics." },
      { id: "andy-clark-3", text: "Cognition leaks out into body and world." },
      { id: "andy-clark-4", text: "The brain should not be seen as primarily a locus of inner descriptions but as a locus of inner structures that act as operators upon the world." }
    ],
    category: "CONTEMPORARY",
    country: "United Kingdom"
  },
  {
    id: "kurt-godel",
    name: "Kurt Gödel",
    lifespan: "1906–1978",
    era: "Austria & USA, 20th c.",
    symbol: "♾️",
    oneLiner: "Some truths can never be proven.",
    bio: "Kurt Gödel was an Austrian-American logician whose incompleteness theorems shook the foundations of mathematics. He proved that in any consistent system rich enough to do arithmetic, there will always be true statements that the system itself can never prove. This ended the dream of a perfect, complete set of rules from which all mathematical truth could be derived. A close friend of Albert Einstein at Princeton, Gödel was a brilliant but intensely anxious man whose work still echoes through logic, computer science, and the philosophy of mind.",
    areas: ["Logic", "Philosophy of Mathematics", "Metaphysics"],
    branchSlugs: ["logic", "metaphysics"],
    quotes: [
      { id: "kurt-godel-1", text: "Either mathematics is too big for the human mind, or the human mind is more than a machine." },
      { id: "kurt-godel-2", text: "The more I think about language, the more it amazes me that people ever understand each other at all." },
      { id: "kurt-godel-3", text: "I don't believe in empirical science. I only believe in a priori truth." },
      { id: "kurt-godel-4", text: "Every error is due to extraneous factors (such as emotion and education); reason itself does not err." }
    ],
    category: "CONTEMPORARY",
    country: "Austria"
  },
  {
    id: "ian-hacking",
    name: "Ian Hacking",
    lifespan: "1936–2023",
    era: "Canada, 20th–21st c.",
    symbol: "🎲",
    oneLiner: "How we count people changes who they become.",
    bio: "Ian Hacking was a Canadian philosopher who brought history and detail to the philosophy of science. He studied how ideas like probability and chance were actually invented, showing that even our most basic concepts have a story. He coined the idea of looping effects: when we classify people, say as a certain kind of patient, those people react to the label and so the category itself shifts. Curious, witty, and wide-ranging, he treated science as a living human practice rather than a finished set of truths.",
    areas: ["Philosophy of Science", "Probability", "Epistemology"],
    branchSlugs: ["epistemology", "logic"],
    quotes: [
      { id: "ian-hacking-1", text: "The final arbiter in philosophy is not how we think but what we do." },
      { id: "ian-hacking-2", text: "Don't ask for the meaning, ask for the use." },
      { id: "ian-hacking-3", text: "I think of human kinds as interactive kinds, kinds that interact with the people classified by them." },
      { id: "ian-hacking-4", text: "Reality has more in it than is allowed by the categories with which we represent it." }
    ],
    category: "CONTEMPORARY",
    country: "Canada"
  },
  {
    id: "bernard-williams",
    name: "Bernard Williams",
    lifespan: "1929–2003",
    era: "Britain, 20th–21st c.",
    symbol: "🎭",
    oneLiner: "Morality cannot be reduced to a single rule.",
    bio: "Bernard Williams was an English philosopher who pushed back against tidy moral systems that try to boil ethics down to one formula. He argued that both strict duty-based ethics and pure utilitarian calculation ignore what actually gives our lives meaning: our deep personal projects and attachments. He introduced unsettling ideas like moral luck, the way our moral standing can hinge on factors we never controlled. Famously sharp in conversation, he insisted that being human is messier and more interesting than any theory can capture.",
    areas: ["Ethics", "Moral Philosophy", "Philosophy of Self"],
    branchSlugs: ["ethics", "metaphysics"],
    quotes: [
      { id: "bernard-williams-1", text: "There can be a moral luck in the most obvious sense, that what one does and what one is may be partly a matter of luck." },
      { id: "bernard-williams-2", text: "It is absurd to demand of such a man, when the sums come in from the utility network which the projects of others have in part determined, that he should just step aside from his own project and decision and acknowledge the decision which utilitarian calculation requires." },
      { id: "bernard-williams-3", text: "Philosophy should try to understand human experience, not to legislate to it." },
      { id: "bernard-williams-4", text: "Man is the measure of all things, in the sense that we have no other measure than ourselves." }
    ],
    category: "CONTEMPORARY",
    country: "United Kingdom"
  },
  {
    id: "peter-singer",
    name: "Peter Singer",
    lifespan: "1946–present",
    era: "Australia, 20th–21st c.",
    symbol: "🐖",
    oneLiner: "If we can prevent suffering, we ought to.",
    bio: "Peter Singer is an Australian philosopher who has done more than almost anyone to push ethics into action. In his work on animals he argued that ignoring a creature's suffering simply because it is not human is a prejudice he named speciesism. His famous drowning-child argument claims that if we would ruin our shoes to save a drowning child, we are equally obliged to give to save distant strangers we will never meet. A founding figure of the effective altruism movement, he insists that good intentions matter less than results that actually reduce suffering.",
    areas: ["Ethics", "Applied Ethics", "Animal Ethics"],
    branchSlugs: ["ethics", "political-philosophy"],
    quotes: [
      { id: "peter-singer-1", text: "If it is in our power to prevent something bad from happening, without thereby sacrificing anything of comparable moral importance, we ought, morally, to do it." },
      { id: "peter-singer-2", text: "The question is not, Can they reason? nor, Can they talk? but, Can they suffer?" },
      { id: "peter-singer-3", text: "The capacity for suffering and enjoyment is a prerequisite for having interests at all." },
      { id: "peter-singer-4", text: "How well we comply with our obligation to those in need is a real test of our moral seriousness." }
    ],
    category: "CONTEMPORARY",
    country: "Australia"
  },
  {
    id: "robert-nozick",
    name: "Robert Nozick",
    lifespan: "1938–2002",
    era: "USA, 20th c.",
    symbol: "🗽",
    oneLiner: "The only just state is a minimal one.",
    bio: "Robert Nozick was an American philosopher whose book Anarchy, State, and Utopia became the great libertarian reply to theories of redistributive justice. He argued that individuals have rights so strong that the government may not violate them even to help others, so taxing one person to aid another is a kind of forced labor. The only legitimate state, he said, is a minimal night-watchman state limited to protecting people from force and fraud. Restless and playful, he refused to keep defending the same view, roaming freely across knowledge, free will, and the meaning of life.",
    areas: ["Political Philosophy", "Ethics", "Libertarianism"],
    branchSlugs: ["political-philosophy", "ethics"],
    quotes: [
      { id: "robert-nozick-1", text: "Individuals have rights, and there are things no person or group may do to them without violating their rights." },
      { id: "robert-nozick-2", text: "The minimal state is the most extensive state that can be justified. Any state more extensive violates people's rights." },
      { id: "robert-nozick-3", text: "Taxation of earnings from labor is on a par with forced labor." },
      { id: "robert-nozick-4", text: "Why is there something rather than nothing? The question appears impossible to answer. Any factor introduced to explain why there is something will itself be part of the something to be explained." }
    ],
    category: "CONTEMPORARY",
    country: "USA"
  },
  {
    id: "isaiah-berlin",
    name: "Isaiah Berlin",
    lifespan: "1909–1997",
    era: "Russia & Britain, 20th c.",
    symbol: "🦊",
    oneLiner: "There are two very different kinds of freedom.",
    bio: "Isaiah Berlin was a Latvian-born British thinker celebrated for his rich history of ideas and his defense of human freedom. In his most famous essay he distinguished negative liberty, freedom from interference, from positive liberty, the freedom to master oneself, warning that the second could be twisted into justifying tyranny in the name of people's real interests. He argued for value pluralism: that genuine human goods, like liberty and equality, can truly clash and cannot all be perfectly combined. A dazzling talker and essayist, he made the history of thought feel urgent and alive.",
    areas: ["Political Philosophy", "History of Ideas", "Liberty"],
    branchSlugs: ["political-philosophy", "ethics"],
    quotes: [
      { id: "isaiah-berlin-1", text: "Liberty is liberty, not equality or fairness or justice or culture, or human happiness or a quiet conscience." },
      { id: "isaiah-berlin-2", text: "The fox knows many things, but the hedgehog knows one big thing." },
      { id: "isaiah-berlin-3", text: "Out of the crooked timber of humanity, no straight thing was ever made." },
      { id: "isaiah-berlin-4", text: "Few new truths have ever won their way against the resistance of established ideas save by being overstated." },
      { id: "isaiah-berlin-5", text: "Freedom for the wolves has often meant death to the sheep." }
    ],
    category: "CONTEMPORARY",
    country: "United Kingdom"
  },
  {
    id: "judith-jarvis-thomson",
    name: "Judith Jarvis Thomson",
    lifespan: "1929–2020",
    era: "USA, 20th–21st c.",
    symbol: "🎻",
    oneLiner: "Vivid thought experiments can crack hard moral puzzles.",
    bio: "Judith Jarvis Thomson was an American philosopher famous for cleverly designed thought experiments that made abstract ethics suddenly concrete. In her defense of abortion she imagined waking up plugged into a sick violinist who needs your kidneys, asking whether you are obliged to stay connected for nine months. She also helped turn the trolley problem into one of the most discussed puzzles in moral philosophy, probing why diverting a runaway trolley feels different from pushing someone to their death. Rigorous and imaginative, she showed how a single well-chosen scenario can reshape an entire debate.",
    areas: ["Ethics", "Applied Ethics", "Metaethics"],
    branchSlugs: ["ethics"],
    quotes: [
      { id: "judith-jarvis-thomson-1", text: "I propose, then, that we grant that the fetus is a person from the moment of conception. How does the argument go from here?" },
      { id: "judith-jarvis-thomson-2", text: "Having a right to life does not guarantee having either a right to be given the use of or a right to be allowed continued use of another person's body." },
      { id: "judith-jarvis-thomson-3", text: "If you do hold a view about a case, it is worth asking yourself why you hold it." },
      { id: "judith-jarvis-thomson-4", text: "Everybody to count for one, nobody for more than one; but a moral theory must say why." }
    ],
    category: "CONTEMPORARY",
    country: "USA"
  },
  {
    id: "tm-scanlon",
    name: "T.M. Scanlon",
    lifespan: "1940–present",
    era: "USA, 20th–21st c.",
    symbol: "🤲",
    oneLiner: "Right actions are ones no one could reasonably reject.",
    bio: "Thomas Scanlon is an American philosopher best known for his contractualist theory of right and wrong. On his view, an action is wrong if it would be forbidden by any set of rules that no one could reasonably reject as a basis for living together. This puts the idea of justifying ourselves to one another at the heart of morality, replacing cold calculation with the question of what we owe to each other. He has also written with great care about tolerance, blame, and the surprisingly tangled nature of free speech.",
    areas: ["Ethics", "Contractualism", "Political Philosophy"],
    branchSlugs: ["ethics", "political-philosophy"],
    quotes: [
      { id: "tm-scanlon-1", text: "An act is wrong if its performance under the circumstances would be disallowed by any set of principles for the general regulation of behavior that no one could reasonably reject as a basis for informed, unforced general agreement." },
      { id: "tm-scanlon-2", text: "Morality is concerned with what we owe to each other." },
      { id: "tm-scanlon-3", text: "To claim that something is a reason is to claim that it counts in favor of some judgment or action." },
      { id: "tm-scanlon-4", text: "The contractualist ideal of acting in accord with principles that others could not reasonably reject is meant to characterize the relation with others the value of which provides the basis for our duties to them." }
    ],
    category: "CONTEMPORARY",
    country: "USA"
  },
  {
    id: "ga-cohen",
    name: "G.A. Cohen",
    lifespan: "1941–2009",
    era: "Canada & Britain, 20th–21st c.",
    symbol: "🚩",
    oneLiner: "Why not run the whole of society like a camping trip?",
    bio: "Gerald Cohen was a Canadian-born philosopher and one of the founders of analytical Marxism, who insisted that socialist ideals be defended with the same rigor as any rival theory. He began by carefully reconstructing Marx's theory of history, then turned to challenge libertarians on their own ground about freedom and self-ownership. In a beloved late work he asked why the fairness and sharing we take for granted on a camping trip could not guide a whole society. Famous for his warmth and humor, he combined deep egalitarian commitment with merciless logical honesty.",
    areas: ["Political Philosophy", "Marxism", "Egalitarianism"],
    branchSlugs: ["political-philosophy", "ethics"],
    quotes: [
      { id: "ga-cohen-1", text: "The primary commitment of our tradition is not to democracy, or to liberty, but to the social equality whose presence the camping trip illustrates." },
      { id: "ga-cohen-2", text: "If you're an egalitarian, how come you're so rich?" },
      { id: "ga-cohen-3", text: "Marxism lost much of its carapace of supporting social science, and we philosophers were thereby forced to defend the values that we espoused." },
      { id: "ga-cohen-4", text: "The way of life of the camping trip is feasible and desirable, and the question is only whether it could be generalized to society as a whole." }
    ],
    category: "CONTEMPORARY",
    country: "Canada"
  },
  {
    id: "alasdair-macintyre",
    name: "Alasdair MacIntyre",
    lifespan: "1929–2025",
    era: "Britain & USA, 20th–21st c.",
    symbol: "📜",
    oneLiner: "Modern morality is the wreckage of a lost tradition.",
    bio: "Alasdair MacIntyre was a Scottish-American philosopher whose book After Virtue argued that modern moral debates are shouting matches because we have inherited only broken fragments of older ethical traditions. Without a shared sense of human purpose, he said, words like good and just lose their grip and become mere expressions of preference. His remedy was a return to virtue ethics rooted in communities, practices, and the idea that a human life is a story moving toward a goal. He insisted that we can only understand who we are by knowing the traditions and narratives we belong to.",
    areas: ["Ethics", "Virtue Ethics", "Political Philosophy"],
    branchSlugs: ["ethics", "political-philosophy"],
    quotes: [
      { id: "alasdair-macintyre-1", text: "I can only answer the question 'What am I to do?' if I can answer the prior question 'Of what story or stories do I find myself a part?'" },
      { id: "alasdair-macintyre-2", text: "Man is in his actions and practice, as well as in his fictions, essentially a story-telling animal." },
      { id: "alasdair-macintyre-3", text: "The good life for man is the life spent in seeking for the good life for man." },
      { id: "alasdair-macintyre-4", text: "A living tradition is a historically extended, socially embodied argument, and an argument precisely in part about the goods which constitute that tradition." }
    ],
    category: "CONTEMPORARY",
    country: "United Kingdom"
  },
  {
    id: "hans-jonas",
    name: "Hans Jonas",
    lifespan: "1903–1993",
    era: "Germany & USA, 20th c.",
    symbol: "🌍",
    oneLiner: "Act so that future life on Earth can continue.",
    bio: "Hans Jonas was a German-born philosopher who fled the Nazis and later forged an ethics for the age of technology. He warned that our new power to reshape and even destroy nature demands a new kind of responsibility, one that reaches across generations to people not yet born. His imperative of responsibility asks us to act so that the effects of our actions remain compatible with the permanence of genuine human life. A pioneer of environmental and bioethics, he urged caution and humility in the face of what science now lets us do.",
    areas: ["Ethics", "Environmental Ethics", "Philosophy of Technology"],
    branchSlugs: ["ethics", "political-philosophy"],
    quotes: [
      { id: "hans-jonas-1", text: "Act so that the effects of your action are compatible with the permanence of genuine human life." },
      { id: "hans-jonas-2", text: "The presence of man in the world had been a self-evident fact too commanding for any explicit position of responsibility for it to arise." },
      { id: "hans-jonas-3", text: "Modern technology has introduced actions of such novel scale, objects, and consequences that the framework of former ethics can no longer contain them." },
      { id: "hans-jonas-4", text: "Only an ethics grounded in the breadth of being, not merely in the singularity or oddness of man, can have significance in the scheme of things." }
    ],
    category: "CONTEMPORARY",
    country: "Germany"
  },
  {
    id: "onora-oneill",
    name: "Onora O'Neill",
    lifespan: "1941–present",
    era: "Britain, 20th–21st c.",
    symbol: "⚖️",
    oneLiner: "Trust matters more than the endless demand for transparency.",
    bio: "Onora O'Neill is a British philosopher who has brought Kant's ethics into urgent modern debates about justice, trust, and bioethics. She argues that real respect for persons means giving them reasons and obligations they could in principle share, not just protecting choices. In her widely heard work on trust she warns that our culture of suspicion and box-ticking transparency can actually erode the trustworthiness it claims to secure. A member of the House of Lords, she has shaped public thinking on consent, autonomy, and the ethics of communication.",
    areas: ["Ethics", "Political Philosophy", "Bioethics"],
    branchSlugs: ["ethics", "political-philosophy"],
    quotes: [
      { id: "onora-oneill-1", text: "If we want a society in which placing trust is feasible we need to look for ways in which we can actively check one another's claims." },
      { id: "onora-oneill-2", text: "Transparency can encourage people to be less honest, so increasing deception and reducing reasons for trust." },
      { id: "onora-oneill-3", text: "We may reasonably hope to restore trust not by increasing control, but by reducing deception." },
      { id: "onora-oneill-4", text: "Real accountability is not a matter of more paperwork but of good judgement well placed." }
    ],
    category: "CONTEMPORARY",
    country: "United Kingdom"
  },
  {
    id: "nel-noddings",
    name: "Nel Noddings",
    lifespan: "1929–2022",
    era: "USA, 20th–21st c.",
    symbol: "🤱",
    oneLiner: "Ethics begins in caring, not in rules.",
    bio: "Nel Noddings was an American philosopher and teacher who placed caring at the very center of ethics. Instead of starting from abstract principles, she argued that morality grows out of the concrete relationship between the one caring and the one cared for, modeled on the attentiveness of a parent to a child. A former math teacher, she brought this vision into education, insisting that schools should nurture students as whole people rather than just fill them with facts. Her work helped launch the care ethics tradition and reshaped how many think about teaching and moral life.",
    areas: ["Ethics", "Care Ethics", "Philosophy of Education"],
    branchSlugs: ["ethics"],
    quotes: [
      { id: "nel-noddings-1", text: "Caring is the very bedrock of all successful education." },
      { id: "nel-noddings-2", text: "When we care, we consider the other's point of view, his objective needs, and what he expects of us." },
      { id: "nel-noddings-3", text: "The primary aim of every educational institution and of every educational effort must be the maintenance and enhancement of caring." },
      { id: "nel-noddings-4", text: "To care and be cared for are fundamental human needs." }
    ],
    category: "CONTEMPORARY",
    country: "USA"
  },
  {
    id: "carol-gilligan",
    name: "Carol Gilligan",
    lifespan: "1936–present",
    era: "USA, 20th–21st c.",
    symbol: "🗣️",
    oneLiner: "Women often speak ethics in a different voice.",
    bio: "Carol Gilligan is an American psychologist and ethicist who challenged the assumption that moral maturity means reasoning by impartial rules. Listening closely to how girls and women actually talked about hard choices, she heard a different voice that emphasized care, relationships, and responsibility rather than abstract justice. Her landmark book In a Different Voice argued that this ethic of care had long been dismissed simply because the standard was built around men. Her work became a foundation of feminist ethics and reshaped psychology, education, and moral philosophy alike.",
    areas: ["Ethics", "Care Ethics", "Feminist Philosophy"],
    branchSlugs: ["ethics"],
    quotes: [
      { id: "carol-gilligan-1", text: "The moral problem arises from conflicting responsibilities rather than from competing rights and requires for its resolution a mode of thinking that is contextual and narrative rather than formal and abstract." },
      { id: "carol-gilligan-2", text: "Women's place in man's life cycle has been that of nurturer, caretaker, and helpmate, the weaver of those networks of relationships on which she in turn relies." },
      { id: "carol-gilligan-3", text: "To have a voice is to be human. To have something to say is to be a person." },
      { id: "carol-gilligan-4", text: "The standard of moral judgment that informs the assessment of moral development has been derived from research on men." }
    ],
    category: "CONTEMPORARY",
    country: "USA"
  },
  {
    id: "seyla-benhabib",
    name: "Seyla Benhabib",
    lifespan: "1950–present",
    era: "Turkey & USA, 20th–21st c.",
    symbol: "🌐",
    oneLiner: "Justice grows from real conversation across differences.",
    bio: "Seyla Benhabib is a Turkish-American philosopher who works at the meeting point of critical theory, feminism, and questions of citizenship. Building on the idea that legitimate norms must emerge from open dialogue, she stresses listening to the concrete other rather than an imagined generic person. She has written powerfully about the rights of refugees and migrants, arguing that hospitality to strangers is a central test of democracy. Her work asks how diverse societies can keep negotiating their shared rules without silencing the very people those rules affect.",
    areas: ["Political Philosophy", "Critical Theory", "Feminist Philosophy"],
    branchSlugs: ["political-philosophy", "ethics"],
    quotes: [
      { id: "seyla-benhabib-1", text: "The right to have rights today means the recognition of the universal status of personhood of each and every human being independently of their national citizenship." },
      { id: "seyla-benhabib-2", text: "We must learn to think from the standpoint of the concrete other and not only the generalized other." },
      { id: "seyla-benhabib-3", text: "Democracies require porous borders, but they also require boundaries." },
      { id: "seyla-benhabib-4", text: "Cultures, like individuals, are not unified, homogeneous wholes but are themselves sites of contestation and negotiation." }
    ],
    category: "CONTEMPORARY",
    country: "USA"
  },
  {
    id: "nancy-fraser",
    name: "Nancy Fraser",
    lifespan: "1947–present",
    era: "USA, 20th–21st c.",
    symbol: "♻️",
    oneLiner: "Justice needs both fair shares and real recognition.",
    bio: "Nancy Fraser is an American critical theorist who argues that justice has more than one dimension. Fighting economic inequality, what she calls redistribution, is not enough if some groups are still denied respect and standing, which she calls recognition. To these she adds representation, having a genuine voice in the decisions that shape your life. Sharply critical of a feminism that simply joins the corporate ladder, she calls for movements that confront capitalism, sexism, and disrespect all at once.",
    areas: ["Political Philosophy", "Critical Theory", "Feminist Philosophy"],
    branchSlugs: ["political-philosophy", "ethics"],
    quotes: [
      { id: "nancy-fraser-1", text: "Justice today requires both redistribution and recognition." },
      { id: "nancy-fraser-2", text: "Neither alone is sufficient. Recognition cannot dispense with redistribution, nor can redistribution dispense with recognition." },
      { id: "nancy-fraser-3", text: "What makes a feminist a feminist is the commitment to overcoming the subordination of women, not adding women to a system that remains unjust." },
      { id: "nancy-fraser-4", text: "The most general meaning of justice is parity of participation." }
    ],
    category: "CONTEMPORARY",
    country: "USA"
  },
  {
    id: "slavoj-zizek",
    name: "Slavoj Žižek",
    lifespan: "1949–present",
    era: "Slovenia, 20th–21st c.",
    symbol: "🎬",
    oneLiner: "Ideology hides inside what we take for granted.",
    bio: "Slavoj Žižek is a Slovenian philosopher and cultural critic famous for mixing dense theory with jokes, Hollywood films, and provocation. Drawing on Hegel, Marx, and the psychoanalyst Lacan, he argues that ideology is most powerful not when we believe it but when it quietly shapes what we do without our noticing. He delights in turning common sense inside out to expose the hidden assumptions of capitalism and everyday life. Restlessly prolific and deliberately outrageous, he has become one of the most recognizable philosophers in the world.",
    areas: ["Continental Philosophy", "Ideology Critique", "Psychoanalysis"],
    branchSlugs: ["political-philosophy", "metaphysics"],
    quotes: [
      { id: "slavoj-zizek-1", text: "They do not know it, but they are doing it." },
      { id: "slavoj-zizek-2", text: "We feel free because we lack the very language to articulate our unfreedom." },
      { id: "slavoj-zizek-3", text: "The true ethical test is not only the readiness to save the victims, but also, even more, the ruthless dedication to annihilating those who made them victims." },
      { id: "slavoj-zizek-4", text: "Beyond the fiction of reality, there is the reality of the fiction." }
    ],
    category: "CONTEMPORARY",
    country: "Slovenia"
  },
  {
    id: "tu-weiming",
    name: "Tu Weiming",
    lifespan: "1940–present",
    era: "China & USA, 20th–21st c.",
    symbol: "☯️",
    oneLiner: "Confucianism is a living global resource, not a relic.",
    bio: "Tu Weiming is a Chinese-American philosopher who has led the revival of Confucian thought for the modern world, an effort often called New Confucianism. He presents Confucianism not as stuffy tradition but as a humanistic path of lifelong self-cultivation, where becoming fully human is an unending learning project. He stresses that the self is never isolated but grows through widening circles of relationship, from family to society to the cosmos. A bridge between East and West, he has championed dialogue among civilizations as essential to a shared human future.",
    areas: ["Confucianism", "Ethics", "Comparative Philosophy"],
    branchSlugs: ["ethics", "metaphysics"],
    quotes: [
      { id: "tu-weiming-1", text: "Learning to be human is a communal act and a never-ending process of self-realization." },
      { id: "tu-weiming-2", text: "The Confucian self is a center of relationships rather than an isolated individual." },
      { id: "tu-weiming-3", text: "We are embedded in a web of human-relatedness from which the self emerges." },
      { id: "tu-weiming-4", text: "Self-cultivation is the root; for the ordinary person no less than for the ruler." }
    ],
    category: "EASTERN",
    country: "China"
  },
  {
    id: "mou-zongsan",
    name: "Mou Zongsan",
    lifespan: "1909–1995",
    era: "China & Taiwan, 20th c.",
    symbol: "🏔️",
    oneLiner: "Chinese thought can complete what Kant left open.",
    bio: "Mou Zongsan was a Chinese philosopher widely regarded as the most systematic thinker of the New Confucian movement. He took up Kant's philosophy seriously and then argued that, where Kant said humans could never have intellectual intuition of the moral good, the Confucian, Daoist, and Buddhist traditions all affirm exactly such a direct moral insight. In this way he claimed Chinese philosophy could carry Kant's project to a conclusion Kant himself thought impossible. His massive writings sought to show that the deepest moral and metaphysical truths were already present in China's own classical traditions.",
    areas: ["Confucianism", "Metaphysics", "Comparative Philosophy"],
    branchSlugs: ["metaphysics", "ethics"],
    quotes: [
      { id: "mou-zongsan-1", text: "Moral practice itself opens the gate to the highest metaphysical reality." },
      { id: "mou-zongsan-2", text: "What Kant could only postulate, the Chinese sages claimed to realize." },
      { id: "mou-zongsan-3", text: "The mind that knows the good and the reality that is good are not two separate things." },
      { id: "mou-zongsan-4", text: "Intellectual intuition, denied to man by Kant, is precisely what the cultivated heart-mind attains." }
    ],
    category: "EASTERN",
    country: "China"
  },
  {
    id: "karl-otto-apel",
    name: "Karl-Otto Apel",
    lifespan: "1922–2017",
    era: "Germany, 20th–21st c.",
    symbol: "💬",
    oneLiner: "Argument itself presupposes shared ethical rules.",
    bio: "Karl-Otto Apel was a German philosopher who argued that the very act of reasoning together commits us to ethics whether we like it or not. He claimed that anyone who seriously enters an argument has already accepted that all affected parties deserve a fair hearing, so denying this would contradict the act of arguing. From this he tried to give morality an unshakable rational grounding in what he called the ideal community of communication. A close ally of Jürgen Habermas, he helped shape the influential school of discourse ethics.",
    areas: ["Ethics", "Philosophy of Language", "Discourse Ethics"],
    branchSlugs: ["ethics", "epistemology"],
    quotes: [
      { id: "karl-otto-apel-1", text: "Whoever argues at all has already accepted the ethical norms presupposed by argumentation." },
      { id: "karl-otto-apel-2", text: "The ideal community of communication is anticipated in every act of serious argument." },
      { id: "karl-otto-apel-3", text: "One cannot deny the presuppositions of argumentation without falling into a performative self-contradiction." },
      { id: "karl-otto-apel-4", text: "Language is not merely a tool of thought but the very medium of reaching understanding with others." }
    ],
    category: "CONTEMPORARY",
    country: "Germany"
  },
  {
    id: "harry-frankfurt",
    name: "Harry Frankfurt",
    lifespan: "1929–2023",
    era: "USA, 20th–21st c.",
    symbol: "🪞",
    oneLiner: "What we care about makes us who we are.",
    bio: "Harry Frankfurt was an American philosopher who reshaped debates about freedom of the will and the self. He argued that what makes us free is not merely doing what we want but having the desires we want to have, a harmony between our first-order wants and our second-order reflections on them. His famous Frankfurt cases challenged the long-held belief that being responsible requires that we could have done otherwise. Late in life he reached a wide public with a small, sharp book analyzing the nature of bullshit, the careless disregard for truth he thought more dangerous than outright lying.",
    areas: ["Metaphysics", "Ethics", "Philosophy of Mind"],
    branchSlugs: ["metaphysics", "ethics"],
    quotes: [
      { id: "harry-frankfurt-1", text: "One of the most salient features of our culture is that there is so much bullshit." },
      { id: "harry-frankfurt-2", text: "It is in securing the conformity of his will to his second-order volitions that a person exercises freedom of the will." },
      { id: "harry-frankfurt-3", text: "The bullshitter ignores these demands altogether. He does not reject the authority of the truth, as the liar does. He pays no attention to it at all." },
      { id: "harry-frankfurt-4", text: "What a person cares about, and how much he cares about it, is a function of various other things, including the choices he makes and the things that simply happen to him." }
    ],
    category: "CONTEMPORARY",
    country: "United States"
  },
  {
    id: "martin-luther-king-jr",
    name: "Martin Luther King Jr.",
    lifespan: "1929–1968",
    era: "USA, 20th c.",
    symbol: "✊",
    oneLiner: "Injustice anywhere is a threat to justice everywhere.",
    bio: "Martin Luther King Jr. was an American Baptist minister and the moral voice of the civil rights movement, who turned a philosophy of nonviolence into a force that reshaped a nation. Drawing on Christian love and Gandhi's example, he led campaigns of peaceful protest against racial segregation in the American South. From a jail cell he wrote an enduring defense of civil disobedience, arguing that an unjust law is no law at all and that people have a moral duty to refuse it openly and lovingly. Awarded the Nobel Peace Prize and assassinated at 39, he remains a towering figure in the philosophy of justice.",
    areas: ["Political Philosophy", "Ethics", "Civil Rights"],
    branchSlugs: ["political-philosophy", "ethics"],
    quotes: [
      { id: "martin-luther-king-jr-1", text: "Injustice anywhere is a threat to justice everywhere." },
      { id: "martin-luther-king-jr-2", text: "One has a moral responsibility to disobey unjust laws." },
      { id: "martin-luther-king-jr-3", text: "The arc of the moral universe is long, but it bends toward justice." },
      { id: "martin-luther-king-jr-4", text: "Darkness cannot drive out darkness; only light can do that. Hate cannot drive out hate; only love can do that." },
      { id: "martin-luther-king-jr-5", text: "An unjust law is a code that is out of harmony with the moral law." }
    ],
    category: "MODERN",
    country: "United States"
  }
];
