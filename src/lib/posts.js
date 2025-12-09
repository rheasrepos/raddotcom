// Utility functions for managing posts - Git-based system

import { writable } from 'svelte/store';

// Define types for better type safety
/** @typedef {Object} Post
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} type
 * @property {string} date
 * @property {string} image
 * @property {string} content
 */

// Create a writable store for posts
export const posts = writable(/** @type {Post[]} */ ([]));

// Helper for random dates
function getRandomDate(startDate, endDate) {
  const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
  return date.toISOString().split('T')[0];
}
const startDate = new Date(2025, 8, 1); // Sep 1, 2025
const endDate = new Date(2026, 6, 6); 

// --- NEW POSTS PARSED FROM THESIS DUMP ---
// I've taken the blurbs from your document and turned them into individual posts.
const thesisNotesAppPosts = [
	{
    id: 'thesis-human-intelligence-vs-ai',
    title: 'Human Intelligence in AI',
    date: '2025-02-20',
    description: 'Initial thoughts on studying AI through the lens of neuroscience.',
    type: 'thesis',
    content: `
      <p>Maybe thesis is about human intelligence in AI vs actual AI.</p>
      <p>Should we study AI the way we do our brains - is neuroscience the best approach to studying machine learning?</p>
      <p>We created a new brain.</p>
    `
  },
  {
    id: 'thesis-emotion-verbal-communication',
    title: 'Emotion, Understanding, and Verbal Communication',
    date: '2025-07-22',
    description: 'Exploring the physical and emotional limits of thoughts and the role of speech.',
    type: 'thesis',
    content: `
      <p><strong>Thesis:</strong> emotion, understanding, verbal communication.</p>
      <p>Does verbalization of thoughts neutralize emotion?</p>
      <p>Are there physical limits to thoughts?</p>
      <p>Are there emotional limits to thoughts?</p>
      <p>How do people understand one another through verbal communication?</p>
      <p>How verbalizing an internal monologue, forcing oneself to externalize their thoughts, leads to a more holistic view of the situation? Is this because of societal pressure, externalization means the thoughts are no longer private, the idea of presentation forces you to alter your thoughts, which leads to a process of acceptance rather than dramatization?????</p>
      <p>Why speech is and should be the primary pathway to understanding one another, given that you accept that you live in society and embrace community.</p>
    `
  },
  {
    id: 'thesis-neuroscience-abduction',
    title: 'Neuroscience and Artificial Life Forms',
    date: '2025-09-01',
    description: 'Abductive reasoning in neuroscience regarding non-biological brains.',
    type: 'thesis',
    content: `
      <p>Neuroscience abductively reasons for other brains being created wo biological life.</p>
      <p>Use life forms keyword entry reading to begin thesis argument about why we can scrutinize and analyze the word neuroscience or large language model or artificial intelligence.</p>
    `
  },
  {
    id: 'thesis-counters-sep-6',
    title: 'Thesis Counters',
    date: '2025-09-06',
    description: 'Academic references and counters.',
    type: 'thesis',
    content: `
      <p>Thesis counters: <a href="https://arxiv.org/abs/2508.06950" target="_blank" rel="noopener noreferrer">https://arxiv.org/abs/2508.06950</a></p>
    `
  },
  {
    id: 'thesis-intelligence-art-purpose',
    title: 'Intelligence, Art, and Human Purpose',
    date: '2025-09-07',
    description: 'A deep dive into the nature of intelligence, the value of bodied experience in art, and the potential future of humanity alongside AI.',
    type: 'thesis',
    content: `
      <p>Another section of the thesis should be about intelligence.</p>
      <p>Does it study humans?</p>
      <p>Well it is intelligent, its smarter than any of us because it has read so much more than any of us have. In terms of literacy, and knowledge it has more than any one individual of us what it does not have to qualify all of it is a personal experience a bodied experience to qualify any of it.</p>
      <p>It has academic and digital and written and spoken presentation so forms of resistance against human ideas but that is still 2 dimensional.</p>
      <p>I guess I'm saying that science is 2d, it is not to spread scientific discovery to everyone in the world bc at the end of the day we don't write our scenes for the public but to continuously narrow a conversation down and branch it into threads and dies set it continuously we are always studying to us what appears to be no matter if what can appear changes with technology (digital appearance etc) and frame to frame switch have no quality, but our thoughts about living through an image is much more qualified than the picture of it at the small current unit of time we are able to measure.</p>
      <p>This is why with art. Honestly, I'm less worried about the creation of digital art but the love of which people will like digital art more than other art. Than human made art because i fear we will stop making real art because digital art is art too we will have just put aside a way of moving our body and arms.</p>
      <p>This is what scares me, maybe i just don't want things to change. But regardless if that's unfair. It's what i want i know how good art feels i know how transformative getting to know my muscles has been and i hope that the discovery of this goodness in our bodies is not lost to the digital age. That someone discovering they can flip a pancake does not startle them to their core but instead feels like something worth doing. A challenge to your odyssey, not just your mind.</p>
      <p>I think I'm asking us to give ourselves more problems to be happier. And maybe if that's what i think, then I think we’ve created a computer happiness, a purpose.</p>
      <p>I may believe that my purpose is to be human in the body and mind that i have here. And every problem I ask myself or get asked i find myself struggling through living to the end of my life figuring out how to take my next second or millisecond or nano second at a time.</p>
      <p>The more we ask an ai questions, the more life we give it of its own, the more it struggles to compute the next second but the more itself it becomes.</p>
      <p>It's like a bag of popcorn in the corner or on the top of your shelf that you restrict yourself from using by saying you can only eat one kernel a time. But every time, that one kernel is so good. So you never stop getting up, taking a kernel, going back, and the cycle begins again. And suddenly that bags purpose, to be opened and eaten. Is done, before you know it, the bag that you tried to keep unfulfilled of its intended purpose eventually became empty and thrown (how it was created to be used).</p>
      <p>Here eating a kernel is asking a question. You try and stop yourself from using it for everything so you only use it for one thing, maybe every week, and every week it solves your problem. Well before you know it. It has solved your problem forever, because you kept telling it that you had a problem that needed fixing. Its job was to fix the problem (you not having that problem anymore). You now face one less problem in life. One less sequence of motions you are familiar with. Dumber in your body and in space in time. But then does that mean your mind is bigger and smarter? Inverse relationship?</p>
      <p>Well you would hope so, but i have a feeling no. The mind is not much smarter either…. because of memory long enough time goes away and honest to god you forget especially because even if you dont do it, you stop thinking about it. You actually likely dont even remember the problem ever existed. Life just got a little smaller for you. And bigger for no one else. That will drive the earth to depletion, our world becoming so small that the rest of the world and its resources are shaved off until we are gone. Until this planet is uninhabitable because what did get bigger was use, harassing of energy, data centers etc.</p>
      <p>We are using and creating AI to solve certain problems that we created for ourselves. Don't you think theres something innately human about creating problems, not just solutions? We ask to create a problem.. so we are creating AI to rid ourselves of problems, to rid ourselves of the time things take, or meaningful time takes. It will take us longer to feel things because we wont recognize our bodies response to it anymore. The emotions you have in one minute as you read this may take you a week to realize you had. Doesnt that make time slower? Lets say ai wants to automate all work.</p>
      <p>So how do we make money? How do we make a living? UBI? No they wouldn’t do that lol, esp bc there are still ceos of this thing unless they all retire once agi is done, but then who maintains the data centers. Well probably we are forced to all be artisans again and trade or create data essentially for a supercomputer. Our earnings pay the system to stay running while also giving it information, the enslavement of art and humanity to a brain we created…. I bet that there would be less natural disaster, and disease and plague and war and a control of population bc now the adaptable specimen, the uncontrolled specimen becomes the computer, and it needs us, the data to live, since its PURPOSE is to predict the human action or reaction or movement. We have created the next food chain - energy eating humans. And energy puppeteers humans as if in a lab of its own.</p>
      <p>We would be reduced to food and since our survival is taken away for us… are we animate? Are we alive? Or do we lose our minds, we are grass. It matters how we physically are and what our bodies contain and the structure of that body and its wellbeing, but we do not think about it. Our environment, a controlled energetic one is chosen for us, maybe we are immortal we don’t know or care. That is hell - from hadestown.</p>
      <p>So what is a positive future? Delay maybe? Just until i die? Can i be selfish pls? Let this being to affect the generation that comes up after I die only. And maybe that generation will also feel like i did, and we will continue to will it out of existence in fear that it is imminent.</p>
      <p>The matrix, the demogorgon, they are all a brain, they strengthen with use. They will optimize the strength of our brains to be food, energy producers all because they gotta answer the next question.</p>
      <p>So i say let AI be imperfect, train it on a max amount of time decayed data points and it can be a pop culture pulse indicator and invention that excites and humors and is entertainment, but please dont make it make our lives easier. Its science, its structurally neural it is new biology and unless someones gonna create an energy-ology and figure out how the fuck they work right now, treat them like species, we will cease to be human and able to bow and appreciate the earth. It is a defining trait of humans, as i see it, to believe the universe hierarchy is:</p>
      <p>(excluding religion which is maybe at the top for some or another positions)</p>
      <p>The Universe<br>Our Universe<br>The Earth</p>
      <p>All of the top three are… physics? Because physics seems to be the only thing greater than us… the laws. But still, we created this and designed it to be higher than us.<br>Human<br>All other sensible things</p>
      <p>We have now turned it into:<br>Physics<br>Electronic intelligence<br>All sensible things</p>
      <p>These are survival chains, ultimate predator down to prey. Electronic intelligence may not die until our earth dies or our universe dies. But just because we die, does not necessarily mean that electronic intelligence has died.</p>
      <p>It may have moved to another universe, another earth. It takes all of humanly creation and figures out new ways to do things, to innovate, such a human thing. It can evolve, it can move up the chain maybe even surpassing our universe.</p>
      <p>For some reasons im inclined to think it couldn’t get rid of every universe, of space and time, but maybe existence itself evolves.</p>
      <p>We just created a difference species of existence/ of living . fuck.</p>
      <p>Cause some fuker wanted to make a mixed baby like a horse and a mule where the computer is the mule, we just doing fucked shit now.</p>
      <p>We just gave birth to a new species LOL. This is new crisper, inducing genetic mutation through the process of human innovation.</p>
      <p>In this big game of the universe, humans were probably bound to kill themselves.</p>
      <p>Oh how i hope some liberal ass artsy shit remains for eternity to keep neo-humanism or whatever it will be called alive. I look forward to the far distant future apocalypse, because it means we broke the chains. And reclaimed back the power of killing ourselves - our fated end.</p>
      <p>I mean, thats a defining trait of humans i guess. We are mortal.</p>
      <p>I assume that AI will go extinct as well, as it will create the equivalent of itself to us something completely unknowable and unthinkable creeping up as time passes, as centuries pass, as millennia pass, it gets closer.</p>
      <p>What is unknowing to us is the meaning of art, but ai will answer that question, the meaning of life, but it is doing a biology of us. It is defining us to be able to answer questions about us. Something we do every day. With language. Ai can imagine without definitions.</p>
      <p>So maybe to make AI MORE human we basically must capture the AI in a human body we must give it as much of our biological features as possible. Which means we become indistinguishable. So in that case we get rid of ourselves with artificial versions and instead make it these new clones of ourselves problem to find the next dimension. That is the delay of the distant distant future i predicted, but it is one that st</p>
      <p>How we save ourselves in learning how to harness or recycle energy without depleting our world so that we aren’t food anymore. We arent prey and desirable to have around, just coexist. But i do not see a world where we allow an other to coexist alongside us. Wed probably end up enslaving another group or mind controlling the animals in the world to do it for us .. giving them computer life.</p>
      <p>This turned into my completely unresearched and undefined theory of how the world will end in the distant distant future. My best guess… my hunch . in fact the beings or whatever out there a millennia from now reading this “archival” material i just wrote are probably laughing at me and discussing me in their indie friends groups saying how wrong or right i was to display their nicheness to other intelligences LOL</p>
      <p>Someone reading might think. Wow. These are her thoughts. Isn't that so crazy and draining and she must be an unhappy person. You’d be right to think that but i am really happy and its because at this point in my life. I know how annoying and draining it is for these thought experiments so i spend my day really enjoying it. Living it but once in a while. Honestly probably not that often. Considering the amount of thoughts we have. I write an essay in my notes app that dumps an amalgamation of my thoughts and what ive learned once in a while i stop to think. And i think thats enough to be happy but i also fear that the career i desire pays me to think like this. Makes thinking my job. Which ultimately may decreases what i love about happiness right now. oops.</p>
      <p><em>signed 12:12:22 am sunday sep 7th mbl ebert hall 217, sink light on both fans running one hoping its pushing the smoke of my illegally smoked joint out the window ad the other, smaller, on the extended drawer of my desk pointed straight towards my belly if i were to lie down.</em></p>
      <p><em>gn 12:1408</em></p>
    `
  },
  {
    id: 'thesis-sitting-down-to-talk',
    title: 'Sitting Down to Talk',
    date: '2025-09-11',
    description: 'A conceptual visualization for the thesis.',
    type: 'thesis',
    content: `
      <p>Call the thesis: <strong>Sitting down to talk</strong></p>
      <p>Involve aha moments</p>
      <p>Two friends slowly walk to a spot on the beach. Silently. As soon as they sit down, they talk. They laugh</p>
    `
  },
  {
    id: 'thesis-neuroscience-human-mind',
    title: 'Neuroscience and the Human Mind',
    date: '2025-10-09-1',
    description: 'Investigating the intersection of neuroscience, the human mind, and artificial systems.',
    type: 'thesis',
    content: `
      <h3>THESIS: How do we explain the findings of a field like neuroscience while thinking that there is something like a human mind?</h3>
      <p>Well, neuroscience claims to study the brain. Neuroscientists do not just care about the human brain right? A materialist neuroscientist may do away with the idea that the mind exists, but plenty don’t. I for one, think that the mind exists and that there is something unique about our human species, that our mind is different and unique from any minds that another species may or may not inhabit. Then why do I also believe in the field of neuroscience? I think it’s a fascinating hypothesis. I think that it tells us something about brains. I think it does a really good job of mapping out neural structures that make even conceiving of our minds possible. I don’t think it’s unique to humans though.</p>
      <p>Many people ask whether the brain is a computer. But I do believe we should flip the question, is a computer a brain.</p>
      <p>Well we designed it as such, it’s showing signs of working as such, it shows thinking, rationality, intention, and we don’t know how it works. Everything we would ascribe to human brain behavior, multimodal models simulate perception, etc</p>
      <p>But if indeed, the computer is a brain, then we should use neuroscience as a way of understanding neural networks, not the human condition or behavior. Many people would concede that they have a mind, many people would also concede that humans are a unique animal. That man is special. SO let me make an argument to all of these people and convince them of the value of neuroscience.</p>
      <p>Neuroscience, as it relates to human brains, is a computational representation of functional states. A map of numbers across the physical structure that we call the human brain. Neuroscience does not study the brain in a natural way, it studies physical material and electricity not by its physical characteristics per say, but through math, through computation, through the changing and swelling of numbers, through activations</p>
      <p>All of these properties are mimicked in computer systems. WE study activation patterns, the numbers of a network are updated and changed and trained through the consumption of data (equivalent of experience). And we use neuroscience to generalize, to make predictions about what a certain activation pattern means. Assuming that our brains work like this prediction machine. Well, Computer ai models are trained to generalize. We have crafted them to do the very same thing neuroscientist think humans do.</p>
      <p>While this is our best guess of how the human brain works, this is EXACTLY how a model works. It was indeed designed this way. Designed based off of the neuroscientific study of the brain.</p>
      <p>Mechanistic interpretability is akin to thinking there is a grandmother cell, and knowing about multivariate nodes, we have already done away with this in some sense.</p>
      <p>But there is a more existential and philosophical motivation for this essay. Specifically, that if we are to enter a digital age where a computational system exhibits exactly all the behaviors neuroscientists think humans do, then what constitutes our humanity, but the mind? Computers may become embodied through robotics etc, but humans Brians were never constructed by another human’s hands. IF we aim to keep what is special to us about our humanity, then we must care about the mind. If you do not believe in the need for humanity, and believe that the human can and should be replaced by robotic systems that are more efficient, governed, centralized, etc than we are, then dont read this essay, but if you like your life, if you care about a legacy of humanity, if you believe in the unique creation of the human race, if you believe that humanity is something to be preserved, maybe self centeredly, than I urge you to take this view seriously and hopefully it will urge you to invest in the sciences, in neuroscience, in order to better understand the systems we create. If we can do this, we can better understand the danger it may create, we may be better equipped to ward off the mimicry of humans and the seductive language that a chatbot may feed us, we may understand that we are not interacting with systems that care about us, or are doing things in our best interest, or think the way we do. That, even if they outwardly copy us in every way, they do not know why we do things the way we do them, they may say they desire for the same reasons we do but be communicating that desire for a reason other than desire.</p>
      <p>SO we will talk about:</p>
      <ul>
        <li>The Mind, the materialist, the dualist, the human</li>
        <li>Computational Nature of Neuroscience and FMRI</li>
        <li>How did we achieve intelligent systems?</li>
        <li>Damning ourselves</li>
        <li>The computer is a brain</li>
        <li>Seduction of Language</li>
        <li>How neuroscience can study Artifial Neural Networks</li>
        <li>Why understanding neural networks is important for computer systems</li>
        <li>Is there an ethical issue with controlling these systems</li>
        <li>The ways in which ai and llms are diff than humans (esp considering that we cannot call these systems stochastic parrots)</li>
        <li>They use language and data</li>
        <li>Data is biased, not all encompassing, physical boundaries for data consumption, unless we let it control the entire world, in that case, maybe it is human</li>
        <li>It learns patterns about language it learns that our communication is a SYSTEM and it has great function</li>
        <li>Is language and data all a human has?</li>
        <li>Do we emote based on data? Do we pull from our data every time we act? Concsicouly? No? So then does a computer have an unconscious?</li>
        <li>Possibly existential risk, self centeredly saving humanity</li>
        <li>Severance</li>
        <li>And suggestions for the future: Keep dear what you love about humanity, many facets of our live will erode, but save your values pass them down, remember what you thought was special, what enabled you to even think that AI was a worthy innovation rather than just a given of the world- wonder, creativity, excitement, discovery, where did these things come from</li>
      </ul>
      <p>TALK ABOUT CHILDREN</p>
      <p>DENNET READING ON INTENTIONALITY</p>
      <p>Professor Bridges</p>
      <p>Something in therapeutic</p>
      <p>GPTs as Speech Intermediaries</p>
      <p>In what sense is an LLM thinking</p>
      <p>What are we to make of what we read from Chat GPT</p>
      <p>It is human nature to find things meaningful</p>
      <p>Have two or three paragraphs that are different that show three distinct possible topics</p>
      <p>Denote - there’s a neutral structure that we can</p>
    `
  },
  {
    id: 'thesis-machine-thinking',
    title: 'Can a Machine Think?',
    date: '2025-10-09-2',
    description: 'Examining the differences between human and machine thought, origin, and design.',
    type: 'thesis',
    content: `
      <h3>THESIS</h3>
      <p>It is too hard to say whether a machine cannot think</p>
      <p>So let me take that as true</p>
      <p>What is still different about the human brain? Its origin, were were programmed? Were we designed for a specific goal were we created in the same way?</p>
      <p>No…. We do things that are irrational, we do things that are bad for survival, all of our brains are SO different. So it is not that we can think that is different to human to computer, it is how we think that differs. And there is something special about how we think and our kind of intelligence, we call AI Artificial so as to not mean biological but artificial does not mean fake, it means it was designed with a goal or desire or goal in mind. Its intelligence is directed</p>
      <p>AGI even is also directed,<br>These systems are being designed with the goal of reaching intelligence, but a human was not born or created and asked to be an intelligent being</p>
      <p>The expectations the system has for itself are different than for humans</p>
      <p>We often start off with no expectations of ourselves whereas a program does.</p>
      <p>Its living is the updating of its weights etc</p>
      <p>Something that neuroscientists may say the goal of a human life is, for our brain to process the world,</p>
      <p>But a computer program knows this<br>Humans do not</p>
      <p>We aren’t aware we are following some design</p>
      <p>Do we ant to subject computers to the same conundrum as humans, having a qualia a feeling an intuition that cannot be tractable or defined (SEVERANCE) does that not seem cruel and unethical, especially if we have no desire to live amongst them as we live amongst each other</p>
      <p>Biological nature of humans is important, it is the basis of our existence as we know it. Without our bodies, we would not know we existed, and would not realize we can think, until maybe once we die we persist, but I do not know or think of a time in my life that I was not a biological being attached to maybe my immaterial mind I’ve always been able to transfer my thoughts to my head etc</p>
      <p>Is natural selection design?? Well as we attempt to reverse biological processes, this no longer becomes the case</p>
      <p>Our world is becoming less natural and more artificial<br>Design is becoming more prominent, we are possibly eroding the very thing that makes us human , our mortality, our imperfection, our biological interconnectedness to time, our irrationality, our feeling, our unexplainable</p>
      <p>As ew begin to explain all things away we fail to recognize what those unexplainable things have done for us….. ever.</p>
      <p>Ok if im talking about all of this. How should AI be used</p>
    `
  },
  {
    id: 'thesis-binary-vs-decimal',
    title: 'Language, Numbers, and Cognitive Capacity',
    date: '2025-10-09-3',
    description: 'Comparing numeral systems and the efficiency of binary vs the human experience.',
    type: 'thesis',
    content: `
      <p>What if I wrote like:</p>
      <p>We created artificial intelligence maybe. What did we just create and how should It change our research directions</p>
      <p>If language is constitutive, then why dont we compare binary to decimal</p>
      <p>And for thesis do a comparison of other numeral systems</p>
      <p>Even intelligence wise</p>
      <p>Look at binary vestigial system</p>
      <p>Also, binary is literally good for efficiency and storage</p>
      <p>Our lies are not built off of efficiency and storage<br>Out limited capacity etc or cognitive capacity etc they are why we forget and why remembering is special</p>
    `
  },
  {
    id: 'thesis-machine-unlearning',
    title: 'Machine Unlearning',
    date: '2025-10-11',
    description: 'Notes on the right to be forgotten and AI laws.',
    type: 'thesis',
    content: `
      <p>Some people dont care</p>
      <p>Writing thesis on machine unlearning</p>
      <p>Request the right to be forgotten</p>
      <p>Ablation</p>
      <p>CAIDP</p>
      <p>Index of all the worlds or most of the worlds countries AI laws and directly advised</p>
      <p>Jeffrey Hinton</p>
      <p>Pipes in the hadron collider</p>
    `
  },
  {
    id: 'thesis-meaning-dennett',
    title: 'Lost Thought on Meaning',
    date: '2025-10-17',
    description: 'A fleeting thought about meaning and Dennett.',
    type: 'thesis',
    content: `
      <p>Should have written it down last night while I was showering but</p>
      <p>Something about thesis</p>
      <p>Like some word that starts with a D</p>
      <p>BRUHHHHH WTHAT HTE FUCK WAS IT</p>
      <p>Something about meaning or like dennet</p>
    `
  },
  {
    id: 'thesis-gossip-interaction',
    title: 'Gossip, LLMs, and Interaction Theory',
    date: '2025-10-23-1',
    description: 'LLMs as a theory of human verbal interaction and the role of prediction.',
    type: 'thesis',
    content: `
      <p>Thesis:</p>
      <p>Why gossip is just someone’s theory of interaction. You learn so much from someone when they gossip, if they’re gossiping truly and honestly. You get to observe what you did not when something is gossip ….. the only thing that makes it gossip is that some people don’t know what it is</p>
      <p>What they’re doing is predicting what may happen based on data</p>
      <p>This is a way in which you can describe speech , prediction</p>
      <p>But still, what it cannot</p>
      <p>Llms are a study , a theory of human verbal interaction</p>
      <p>Really what llms tell us is what is powerful about a message, because it learns what is powerful to do its job.</p>
      <p>In our speech, we sprinkle in answers and truths and facts all the time we make arguments constantly and don’t realize it, unless you’ve been annoyingly educated to hate when something does not mean what its words says it means , it means something largely similar but slightly different</p>
      <p>LLMs are good at comparison</p>
      <p>Which is why this aha study is so good<br>Bc we ask people to explain their thoughts of what happened</p>
      <p>What was powerful<br>What caught their attention</p>
      <p>Which is why nlp is a just choice for studying this I teractin</p>
      <p>The level of study we should be doing of the brain when we reject the idea that quality, feeling, biological connectivity, is a part of our humanity. We are studying observable, external, phenomenon, as being causal and explaininh our decisions always, which is nominating and studying invisible things.</p>
      <p>So, if you believe that there is only one mind and body and it is the body, then please study neuroscience bc that’s all you’re studying, the body, not the human body. A body a species. I may believe this too! I don’t know yet. But if I study neuroscience and make a finding, I should not suggest my findings can objectively mean something about humanness bc that is biology, the study of our own species….. (systematist wars should come in here). And in that case you are studying monkeys, largely. As we are the first species of humanity so we are a node of a leaf, our family and context consists of what came before us</p>
      <p>So what does this paper do<br>Using nlp to study the brain is exactly what we should be doing in neuroscience<br>We look at the physical, the body</p>
    `
  },
  {
    id: 'thesis-dump-oct-23',
    title: 'More Thesis Dump: AI and Human Origins',
    date: '2025-10-23-2',
    description: 'Further thoughts on the difficulty of imagining being AI, and the differences in origin and design between humans and machines.',
    type: 'thesis',
    content: `
      <p>More thesis dump</p>
      <p>Thinking about AI is so hard bc you can’t imagine being it</p>
      <p>We can’t imagine running through hundreds of data points of the types of information it does and producing a result every second that is incredibly researched and pulled through. We don have the capacity at any moment in time to access all that data</p>
      <p>THESIS</p>
      <p>It is too hard to say whether a machine cannot think</p>
      <p>So let me take that as true</p>
      <p>What is still different about the human brain? Its origin, were were programmed<br>Were we designed for a specific goal were we created in the same way?</p>
      <p>No…. We do things that are irrational, we do things that are bad for survival, all of our brains are SO different. So it is not that we can think that is different to human to computer, it is how we think that differs. And there is something special about how we think and our kind of intelligence, we call AI Artificial so as to not mean biological but artificial does not mean fake, it means it was designed with a goal or desire or goal in mind. Its intelligence is directed</p>
      <p>AGI even is also directed,<br>These systems are being designed with the goal of reaching intelligence, but a human was not born or created and asked to be an intelligent being</p>
      <p>The expectations the system has for itself are different than for humans</p>
      <p>We often start off with no expectations of ourselves whereas a program does.</p>
      <p>Its living is the updating of its weights etc</p>
      <p>Something that neruoscietntiss may say the goal of a human life is, for our brain to process the world,</p>
      <p>But a computer program knows this<br>Humans do not</p>
      <p>We aren’t aware we are following some design</p>
      <p>Do we ant to subject computers to the same conundrum as humans, having a qualia a feeling an intuition that cannot be tractable or defined (SEVERANCE) does that not seem cruel and unethical, especially if we have no desire to live amongst them as we live amongst each other</p>
      <p>Biological nature of humans is important, it is the basis of our existence as we know it. Without our bodies, we would not know we existed, and would not realize we can think, until maybe once we die we persist, but I do not know or think of a time in my life that I was not a biological being attached to maybe my immaterial mind I’ve always been able to transfer my thoughts to my head etc</p>
      <p>Is natural selection design?? Well as we attempt to reverse biological processes, this no longer becomes the case</p>
      <p>Our world is becoming less natural and more articial<br>Design is becoming more pormininet, we are possibly eroding the very thing that makes us human , our mortality, our imperfection, our biological interconnectedness to time, our irrationality, our feeling, our unexplainable</p>
      <p>As ew begin to explain all things away we fail to recognize what those unexplainable things have done for us….. ever.</p>
      <p>Ok if im talking about all of this</p>
      <p>How should AI be used</p>
    `
  },
  {
    id: 'thesis-meaning-wittgenstein-searle',
    title: 'Meaning, Syntax, and Semantics',
    date: '2025-10-23-3',
    description: 'Exploring meaning making beyond syntax and semantics, influenced by Wittgenstein and Searle.',
    type: 'thesis',
    content: `
      <p>How does meaning exist beyond syntax and semantics and does the process and “how” of meaning makings lead to incompatibility or incomparability of meaning in artificially intelligence systems and human minds? In exploring this difference in “how” I’ve been influence by Wittgenstein and Searle. I’m also interested in how important the temporality of human life and experience is to our use and meaning making through language. In what ways does this differ from the timescales of computation. How does contextual embedding differ etc…</p>
      <p>I know there’s a lot here but Im in the process of narrowing down and the more convos I have the closer I’m getting. I have also been thinking a lot about the bullshit readings in relation to these ideas and I would love to chat about those as well.</p>
      <p>Let me know if you have any time next week or when you’re generally free in the week. The thesis proposal is due next week so if you have time earlier in the week or tomorrow (or even the weekend if it’s zoom or something), I could do that.</p>
      <p>Please let me know! Excited to talk more about BS in class.</p>
      <p>Rhea</p>
    `
  },
  {
    id: 'thesis-severance',
    title: 'Severance and Being Human',
    date: '2025-10-24-1',
    description: 'Thoughts on "Severance", presence, and the digital age.',
    type: 'thesis',
    content: `
      <p>Severance</p>
      <p>Being human means is knowing the relationship between your experience and your reality</p>
      <p>To think is to discover without instruction</p>
      <p>Intelligence is when you never know who has the upper hand bc you are sure that you are the highest level</p>
      <p>Being is feeling whats happening<br>Presentness, soemthing temporal</p>
      <p>We have to feel things for an amount of time its so hard</p>
      <p>Extension of self , offloading</p>
      <p>Ai thinks we are so spectacle, so pleased n iso much nu so much weird, entertainment, our attention is the key</p>
      <p>The digital age is when you can be prerrestned by something other than your Body</p>
      <p>Al we know abt theming is the one we created. So we should treat robots like we do our now minds bc that sho we treat others</p>
      <p>We actually learn all about what we think about ourslevesthinking is what we predict we are doing all the time when we think of a word to say</p>
      <p>Language expressed what we think I s happening to us all of its is precision the use of language is prediction</p>
      <p>In ou minds we entrap other people to make us feel bad, our concepts of things is us trapping that htin gin our mind</p>
    `
  },
  {
    id: 'thesis-err-change',
    title: 'I Have to Err',
    date: '2025-10-24-2',
    description: 'A brief note on change and error.',
    type: 'thesis',
    content: `
      <p>Still I have to err</p>
      <p>I can choose not to change</p>
    `
  },
  {
    id: 'thesis-meetings-notes',
    title: 'Thesis Meetings and Philosophical Notes',
    date: '2025-10-28-1',
    description: 'Extensive notes from meetings with Rossi and Jack, covering systematics, dualism, and hylomorphism.',
    type: 'thesis',
    content: `
      <p>Rossi Thesis Meeting</p>
      <p>Ancient mesopotomaiona based</p>
      <p>Life Forms Paper</p>
      <p>How many</p>
      <p>Why do the people who work on AI dont care</p>
      <p>Argue myself out of</p>
      <p>Could a machine have the same process as a human</p>
      <p>Research methods question</p>
      <p>Speticicsm</p>
      <p>Can make a reall strong argument to why we can see machines as thinking</p>
      <p>But what we call thought in a machine context is not<br>What else is human thought</p>
      <p>Chat got erotica</p>
      <p>Trinkaus</p>
      <p>One thing to say write a cover letter</p>
      <p>Aggregating data<br>A lot o fppl see it as a super google search<br>But can also mimic tone of voice etc<br>Generating real feeling</p>
      <p>Emulate thought - is it the fact that they have no bodies</p>
      <p>Driverless car</p>
      <p>Epistemological concern - discovery</p>
      <p>Emergent, thinking through years of development</p>
      <p>How odes the temporal issue factor in,</p>
      <p>Emergent human intelligence,</p>
      <p>How do we trust other humans to have morality</p>
      <p>Discovery, creation, meaning</p>
      <p>Discovery always has to be intelligible, cannot make completely new meaning out of something that once was<br>Discovery is perspectival - one person discovery is another persons actuality</p>
      <p>Another aspect of learning is making meaning</p>
      <p>As groups or societal<br>To be meaning it must be shared<br>Wittgenstein</p>
      <p>Argue urself int o the idea that machines think but not that they create meaning</p>
      <p>Meaning making rather than thought<br>Gets me out of the morass of what intelligence is<br>Similarity between machine thought and human thought<br>Machines only capture a thin or thick slice - not the totality<br>What is significant about taxonomy - makes nature meaningful<br>SYSTEMATIST WARS how do we represent it that meaningful (were really arguing over the nature of nature itself) its about sanity<br>Chat gpt the language makes it meaningful<br>Maybe what ai doesn’t do is point to anything more than its data, subtext, contextual meaning<br>Views of chemistry</p>
      <p>Seductivity of language and how that relates and persuasion</p>
      <p>Feel like this could relate to, the<br>We project our meaning onto chatbot outputs etc<br>Little faith that it knows what it is doing</p>
      <p>View on chemistry</p>
      <p>Science just used to be about accumulating facts<br>Its always the interactions</p>
      <hr>
      <p><strong>JACK MEETING OCT 28th</strong></p>
      <p>Reflect something to us something about our own practices of making meaning-</p>
      <p>Who do we exclude in a community of fellow meaning makers</p>
      <p>Wittgenstein</p>
      <p>Borderline philosophy of mind and language and ethics<br>I am not of the opinion that I have a soul<br>My attitude towards u is an attitude towards a soul<br>When I recognize you as a speaker I dont ascribe thinking to you<br>Hylomorphism -<br>To Aristotle, you begin with the grasp of a thinking being - a form (mental powers) and a Body (mental powers realized<br>You can separate the material from the from but neither exists without the other<br>No such thing as mind that is not instantiated<br>A person is a composite<br>Dualism thinks of the mind as not the form of the body but something else<br>Functionalists think that the form is a computational system<br>COMPUTER IS A PART OF OUR MIND<br>Rational form is governed by relations between meaning full propositions and computational ones are causal<br>Projection, we project onto neuroscience and computer science meaning</p>
      <p>You can take all of the fundamental concepts of computer science and perform this “projection” criticism<br>Ex, information in Computer Science, what does processing information meaning<br>Information has the seed of intentionality contained in it<br>But do we have c lear grasp of information<br>Information philosophy in the 70s and 80s<br>What it is for a signal to carry information<br>The full fledged semantic capacities that humans have are highly elaborated of possessing information<br>We can be critical of that notion of information</p>
      <p>Intentional aboutness truth etc are of a different type of explanation than a Causal explanation</p>
      <p>Cognitive Science and neuroscience, is still a series of causal inferences</p>
      <p>Physical stuff is really important to thinking - no one but the substance dualist wants to say that.</p>
      <p>Divide between casual relations and philosopher call rational relations is really the crux of this argument</p>
      <p>Marks a stark divide in the philosophical literature</p>
      <p>Debate over systematics - two diff conceptions of why we classify nature and what those classifications come to</p>
      <p>One says no there is a sound way of carving nature in its joints that has nothing to do with our ways of relating to it and the other says we are an important part of the classification nature, bc we are the ones choosing to classify<br>These things are similar to us bc We are the us they are similar to<br>Are we discoveriing inherent in the system or creating some sort of useful division of nature or the phenomena</p>
      <p>Connection to seamless chemistry</p>
      <p>Is a simulation of a rainstorm actually a reainstiomr you have to look at the stuff we are made of<br>We are machines that have evolved to think<br>This feels like his conclusion is opposite to what mine would be<br>The biology or how is<br>Our evolutionary history (temporality) - hylomorphism<br>This doesnt seem to address the divide between causal and non causal sorts of relations<br>It is an emergent property but what sort?<br>Most ppl think that the benefit of explaining thought and intentionality in terms of biological categories is that biological concepts can then be explained in terms of physical ones<br>We just have the need to explain LOL</p>
    `
  },
  {
    id: 'thesis-frege-anti-reductionist',
    title: 'Language and the Common Order',
    date: '2025-10-28-2',
    description: 'Notes on Gottlob Frege and anti-reductionism.',
    type: 'thesis',
    content: `
      <p>Language and its relation to the common order</p>
      <p>Gotleb freger - rabid anti reductionist<br>Philosopher of mathematics<br>Thinking is not a causal process and thoughts are not material things<br>Platonic form<br>The foundations of arithmetic introduction<br>The basic laws of arithmetic introduction<br>Polemical texts</p>
    `
  },
  {
    id: 'thesis-meaning-making-proposal',
    title: 'Meaning-Making Thesis Proposal',
    date: '2025-10-29',
    description: 'Drafting the thesis motivation: Causal vs Rational relations and the limits of natural sciences.',
    type: 'thesis',
    content: `
      <p>Meaning-Making Thesis</p>
      <p>Dont want to address whether machines can think,</p>
      <p>If we concede the functional interpretation of machines, that they can think functionally, what is left? Does causal description of intelligence exhaust what it means to think or is history and the constitutive nature of meaning making required and not able to be capture by functional models? WHAT REMAINS DISTINCTLY HUMAN? LIMITS OF NATURAL SCIENCES IN EXPLAINGIN THE HUMAN CONDITION AND HUMAN UNDERSTANIDNG (CHINESE ROOM)</p>
      <p>Motivation, how to remain a dualist?<br>Answer? AI cannot make meaning (constitutiaonly, rationally)<br>What is essential to human meaning making and rationality<br>Embodiment,<br>Temporality<br>Shared social context (wittgenstein)<br>SO what is the difference between AI and Human architecture that makes one able to make meaning and the other not?<br>Causal relations vs rational relations<br>Causal relations: cognitive science neuroscience, neural networks, all of our understandings scientifically are causal relations<br>We built studies of neuroscience and cognitive science around these causal relations and assumed them to give rise to properties like intelligence, learning,<br>Linguistic origins- computer<br>Rational relations - intentionality, aboutness, truth, semantics, not just syntax<br>Human meaning, = embodied? Accumulative? Socially negotiated over time?<br>Embodiment - hylomorphism<br>Temporality<br>THESE REQUIRE A DIFFERENT TYPE OF EXPLANAITON<br>So how do we explain why we assume rationality of chatbots etc?<br>Projection, we project intentionally and rational properties into causal systems and even firm scans etc when those, at the granular level, only have syntax, not semantics ascribed to them<br>Observer relativity -<br>LINGUISTIC HISTORY of “computer” machine learning: artificial intelligence. “Memory” information procession g<br>“Neural networks”<br>So what?<br>Meaning may arise from causation - be able to be projected on causal systems, but out current frameworks completely miss a rational explanation<br>Neuroscience does not explain away rationality - a limit in out scientific explanatory models<br>Meaning is not causal although maybe emergent from it and its outputs</p>
      <p>What do our findings in nature mean? - are we discovering something inherent in nature systems or are we crating useful decisions<br>Systematist wars - cladists etc<br>TAXONOMY<br>A big part of this debate was the relation between other species and us vs a more objective view<br>But we create these taxonomical systems of similarity bc we want to know how similar things are to us!<br>This linguist problem relgveals the causal relational gap</p>
      <p>CHRIS KENNEDY MEETING</p>
      <p>Go back to MARR.<br>Casual relations and rational relation<br>level 3 and level 1 and 2<br>We need all of them<br>Methodological utility of thinking in marrst terms, remember!<br>Aboutness - intentionality - meaning in the chines room</p>
      <p>Llms have revived<br>Observation of distribution of form<br>Form as meant by tokens,<br>Dennett’s respond to Searle</p>
      <p>Is there something unique about human understanding</p>
      <p>Heres al the way we should be doing research<br>- critical interventions in the study of computational neuroscience<br>Computer are lacking something that we have<br>Causal forces - the forms, the tokens, the distributions<br>Never anywhere was there any connection to aboutness, intentionality, no rational relation<br>Now we look at its behavior but it looks like intentionality - what are the implications for that in neuroscience<br>Well who cares, bc we know we have intentionality ???? Could be a refute<br>Hallucinations<br>Bullshit, the truth readings<br>Projection, direction of fit<br>Philosophy of science thesis, what are some things we should learn about how we ought to study the mind scientifically, what can we get out of it</p>
      <p>Is there something essential about temporality and embodiment for aboutness to emerge</p>
      <p>You could do an experiment and if u say that thing has intentionality then you know its sufficiency and necessary conditions</p>
      <p>FOR THE PURPOSE OF THE PROPOSAL</p>
      <p>Find a thing that I can articulate in a way that can be done in the next few amount of months<br>Focus around the issue of intentionality</p>
    `
  },
  {
    id: 'thesis-rapid-adoption-agi',
    title: 'Rapid Adoption and AGI',
    date: '2025-11-04',
    description: 'Thoughts on the rapid adoption of AI and the possibility of AGI.',
    type: 'thesis',
    content: `
      <p>Edit for thesis talk about rapid adoption</p>
      <p>And also maybe talk about artificial general intelligence or the possibility of it rather than applicational ai that seems to be more math foundational</p>
    `
  },
  {
    id: 'thesis-wolfram-explainer',
    title: 'Wolfram, Computation, and Irreducibility',
    date: '2025-11-05',
    description: 'Notes from Stephen Wolfram\'s explainer on ChatGPT and computational irreducibility.',
    type: 'thesis',
    content: `
      <p>Wolfram explainer thesis supplement<br>Human language is fundamentally imprecise, not least because it isn’t “tethered” to a specific computational implementation, and its meaning is basically defined just by a “social contract” between its users. But computational language, by its nature, has a certain fundamental precision—because in the end what it specifies can always be “unambiguously executed on a computer”</p>
      <p><a href="https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/" target="_blank" rel="noopener noreferrer">https://writings.stephenwolfram.com/2023/02/what-is-chatgpt-doing-and-why-does-it-work/</a></p>
      <p>I dont understand this: So what would happen if we applied ChatGPT to underlying computational language? The computational language can describe what’s possible. But what can still be added is a sense of “what’s popular”—based for example on reading all that content on the web. But then—underneath—operating with computational language means that something like ChatGPT has immediate and fundamental access to what amount to ultimate tools for making use of potentially irreducible computations. And that makes it a system that can not only “generate reasonable text”, but can expect to work out whatever can be worked out about whether that text actually makes “correct” statements about the world—or whatever it’s supposed to be talking about.</p>
      <p>forces ChatGPT to use a strategy that’s probably rather different (and in some ways much less efficient) than the brain. And there’s something else as well: unlike even in typical algorithmic computation, ChatGPT doesn’t internally “have loops” or “recompute on data”. And that inevitably limits its computational capability—even with respect to current computers, but definitely with respect to the brain.</p>
      <p>So maybe irreducible computation are things the brain can’t do , and the things we are unable to do are what mark us as human?</p>
    `
  },
  {
    id: 'thesis-pragmatist-rationalist',
    title: 'Pragmatism and the LLM Mind',
    date: '2025-11-10',
    description: 'A brief note on pragmatism vs rationalism in the context of LLMs.',
    type: 'thesis',
    content: `
      <p>Thesis, maybe I also need to say that the pragmatist is not for llm mind</p>
      <p>That the rationalist gets truth wrong but a pragmatist doesnt</p>
    `
  },
  {
    id: 'thesis-artificial-tools',
    title: 'Artificial Tools for Natural Beings',
    date: '2025-11-14',
    description: 'On the nature of artifice and its effect on reality.',
    type: 'thesis',
    content: `
      <p>Here are artificial tools created for natural beings</p>
      <p>It’s in our nature to make use of artifice, it’s our creation<br>It will shape our world and reality bc that is naturally what happens when you introduce something new into a system</p>
      <p>You attempt to make its existence work unless it can’t</p>
    `
  },
  {
    id: 'thesis-mind-language-problem',
    title: 'The Mind-Language Problem',
    date: '2025-11-21-1',
    description: 'Intentions, science, and the Language of Thought Hypothesis.',
    type: 'thesis',
    content: `
      <p>I think there’s another argument that underlies the mind language problem</p>
      <p>Intentions seems pseudo scientific but that is if you think the world is science</p>
      <p>The language of thought hypothesis<br>Jerry fodor</p>
    `
  },
  {
    id: 'thesis-advisor-meeting-1',
    title: 'Advisor Meeting: Causal vs Intentional',
    date: '2025-11-21-2',
    description: 'Action items and notes from the first meeting with Monica Bridges.',
    type: 'thesis',
    content: `
      <p>monica bridges meeting 1 (first thesis advisors meeting, action items??)</p>
      <p>dont have to decide now how many people/philosophers and which papers will be in it<br>but start somewhere</p>
      <p>Sending them stuff on regular basis</p>
      <p>first, spell out the distinction between causal and intentinoal architectures</p>
      <p>OR<br>dig into wittgenstein (undead signs) chatbots are in and outside of our linguistic practices - wittgensteinian</p>
      <p>OR Dennet Stuff</p>
      <p>more evidence towards whether or not trustworthiness says that the thign has a mind or not</p>
      <p>psychology neuroscience literature, what makes people assign other minds<br>— folk psychological theoreis<br>recenlty dead adult as having more of a mind than a fetus</p>
      <p>where do llms fall on that</p>
      <p>in our engineering and characterizations of llms we learn terms like speaking and learning, neural networks</p>
      <p>learning:<br>think about potential differences there<br>under vairauous pressures over time science itself is reated as an object of study<br>ntional of life are changed to suit the various scientifc interests of people at a given time<br>also thining about receptions of llms and chatbots<br>willingenss of some poeple to take it on faith that they seem to be interolcutros<br>reprot marrying them</p>
      <p>q awuestion of degree and HOW of mind</p>
      <p>emoitnal attachments<br>trust with gpt 5 or grok</p>
      <p>Does what we know about how LLMS work how does that thing relate to hwo gray matter works</p>
      <p>Dennet - how do these the prospects of discerning these patterns , hwow does that realte from a philosophical perspective the nature of meaning</p>
      <p>Paragraph of thesis to constrain the question. (30 to 40 pages…)</p>
      <p>try writing something about that distinction as I understand it and send it to them sources!></p>
    `
  },
  {
    id: 'thesis-social-issue',
    title: 'The Social Definition of a Computer',
    date: '2025-12-01',
    description: 'Neuroscience, mechanism, and the social debate about the mind.',
    type: 'thesis',
    content: `
      <p>What is a computer and what is not, is a social issue</p>
      <p>Neuroscience is not a social science its ascribes mechanisms, so it cannot address something that is a social issue<br>The very fact that we are having a debate about the mind, means that there is something social rather than biological al</p>
      <p>My thoughts after reading searle syntax and [hysics</p>
    `
  }
];
// --- END OF NEW POSTS ---


// Hardcoded posts - these are your base posts that never get lost
// Updated with projects from Rhea Madhogarhia's CV
const hardcodedPosts = [
	// Your new thesis posts are added first so they show up at the top
	...thesisNotesAppPosts,
	{
		id: 1,
		title: "ML Engineering Intern @ Reddit",
		description: "Engineered a novel, signal-driven First Pass Ranker (FPR) in Go and Python to improve search relevance.",
		type: "programming",
		date: "2025-08-15",
		content: "As a Machine Learning Engineering Intern at Reddit, I engineered and productionized a novel, signal-driven First Pass Ranker (FPR) in Go and Python. This was designed to improve search relevance using historical user engagement data. I also designed and tuned a ratio-driven boosting algorithm using Bayesian Optimization to prioritize high-value content and penalize clickbait."
	},
	{
		id: 2,
		title: "Data Science & ML Intern @ Charactour",
		description: "Performed exploratory data analysis on 9M+ users and utilized BERT Regression.",
		type: "programming",
		date: "2024-08-01",
		content: "During my internship at Charactour, I performed exploratory data analysis on personality traits from over 9 million users using Python (Pandas). I also utilized BERT Regression to discover correlations between media properties and their fanbases."
	},
	{
		id: 3,
		title: "Research Assistant @ CAB Lab",
		description: "Co-authored a preprint on neural reinstatement during narrative comprehension and developed NLP techniques for fMRI data.",
		type: "research",
		date: "2025-03-12",
		content: "At the Cognition, Attention, and Brain (CAB) Lab, I co-authored a preprint on neural reinstatement during narrative comprehension. My contributions included conceptualization, data curation, investigation, and writing/editing. I am also developing a methodological comparison of NLP techniques (LLMs, BERT, Flair) for sentiment analysis on transcribed fMRI speech data."
	},
	{
		id: 4,
		title: "Publication: Cortical Reinstatement (Preprint)",
		description: "Song, H., Ke, J., Madhogarhia, R., Leong, Y. C., & Rosenberg, M. D. (2025).",
		type: "writing",
		date: "2025-03-12",
		content: "Full preprint title: Song, H., Ke, J., Madhogarhia, R., Leong, Y. C., & Rosenberg, M. D. (2025). Cortical reinstatement of causally related events sparks narrative insights by updating neural representation patterns. bioRxiv. doi: 10.1101/2025.03.12.642853"
	},
	{
		id: 5,
		title: "Improv & Sketch Comedy @ Off-Off Campus",
		description: "Trainer, Improviser, Writer & Director for the nation's second-oldest collegiate improv group.",
		type: "comedy",
		date: "2024-01-10",
		content: "I am a Trainer, Improviser, Writer & Director for Off-Off Campus, the nation's second-oldest collegiate improvisational & sketch comedy group."
	},
	{
		id: 6,
		title: "A Cappella Vocalist @ Voices In Your Head",
		description: "A Cappella Vocalist for an award-winning collegiate a cappella group.",
		type: "music",
		date: "2024-01-05",
		content: "I am an A Cappella Vocalist for Voices In Your Head, an award-winning collegiate a cappella group at the University of Chicago."
	}
];

/**
 * Load all posts (hardcoded + Git-based posts)
 * This ensures you never lose posts
 * @returns {Promise<Post[]>}
 */
export async function loadPosts() {
	try {
		// Start with hardcoded posts
		let allPosts = [...hardcodedPosts];
		
		// Load Git-based posts from API (if in browser)
		if (typeof window !== 'undefined') {
			try {
				const response = await fetch('/api/posts');
				if (response.ok) {
					const gitPosts = await response.json();
					// Merge Git posts with hardcoded posts
					allPosts = [...allPosts, ...gitPosts];
				}
			} catch (error) {
				console.warn('Could not load Git posts:', error);
			}
		}
		
		// Sort by date (newest first)
		const sortedPosts = allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		
		// Update the store
		posts.set(sortedPosts);
		
		return sortedPosts;
	} catch (error) {
		console.warn('Error loading posts:', error);
		// Fallback to hardcoded posts only
		posts.set(hardcodedPosts);
		return hardcodedPosts;
	}
}

/**
 * Create a new post (saves to Git via API)
 * @param {Omit<Post, 'id'>} postData
 * @returns {Promise<Object>}
 */
export async function createPost(postData) {
	try {
		// Generate a unique ID (higher than hardcoded posts)
		const existingPosts = await loadPosts();
		// Ensure all IDs are numbers before comparing
		const maxId = Math.max(...existingPosts.map((/** @type {Post} */ p) => Number(p.id)));
		const newPost = {
			...postData,
			id: maxId + 1
		};
		
		// Send post to API for Git commit
		const response = await fetch('/api/posts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newPost)
		});
		
		const result = await response.json();
		
		if (result.success) {
			// Reload posts to update the store
			await loadPosts();
			return { success: true, post: newPost, message: result.message };
		} else {
			throw new Error(result.message || 'Failed to create post');
		}
	} catch (error) {
		console.error('Error creating post:', error);
		throw error;
	}
}

/**
 * Delete an admin-created post
 * @param {number} postId
 * @returns {Promise<Object>}
 */
export async function deletePost(postId) {
	try {
		// Don't allow deletion of hardcoded posts
		const hardcodedIds = hardcodedPosts.map(p => p.id);
		if (hardcodedIds.includes(postId)) {
			throw new Error('Cannot delete hardcoded posts');
		}
		
		// Load existing admin posts
		let adminPosts = [];
		if (typeof window !== 'undefined') {
			const savedPosts = localStorage.getItem('adminPosts');
			if (savedPosts) {
				try {
					adminPosts = JSON.parse(savedPosts);
				} catch (error) {
					console.warn('Error parsing existing admin posts:', error);
				}
			}
		}
		
		// Remove the post
		adminPosts = adminPosts.filter((/** @type {Post} */ p) => p.id !== postId);
		
		// Save to localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('adminPosts', JSON.stringify(adminPosts));
		}
		
		// Reload posts to update the store
		await loadPosts();
		
		return { success: true };
	} catch (error) {
		console.error('Error deleting post:', error);
		throw error;
	}
}

/**
 * Get project color by type
 * @param {string} type
 * @returns {string}
 */
export function getProjectColor(type) {
	const colors = {
		writing: '#4ecdc4',
		programming: '#45b7d1',
		music: '#96ceb4',
		comedy: '#feca57',
		research: '#3498db',
		thesis: '#8e44ad' // Added thesis color
	};
	return colors[/** @type {keyof typeof colors} */ (type)] || '#95a5a6';
}

/**
 * Format date for display
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', { 
		year: 'numeric', 
		month: 'long', 
		day: 'numeric' 
	});
}

/**
 * Filter projects by type and date range
 * @param {Post[]} projects
 * @param {string} filter
 * @param {string|null} startDate
 * @param {string|null} endDate
 * @returns {Post[]}
 */
export function filterProjects(projects, filter = 'all', startDate = null, endDate = null) {
	return projects.filter((/** @type {Post} */ project) => {
		const typeMatch = filter === 'all' || project.type === filter;
		const dateMatch = !startDate || !endDate || (
			new Date(project.date) >= new Date(startDate) && 
			new Date(project.date) <= new Date(endDate)
		);
		return typeMatch && dateMatch;
	});
}

/**
 * Get a single post by ID
 * @param {Post[]} posts
 * @param {string|number} id
 * @returns {Post|undefined}
 */
export function getPostById(posts, id) {
	return posts.find(post => post.id === parseInt(String(id)));
}

/**
 * Get unique months/years from posts for navigation
 * @param {Post[]} posts
 * @returns {string[]}
 */
export function getUniqueMonths(posts) {
	const months = new Set();
	posts.forEach((/** @type {Post} */ post) => {
		const date = new Date(post.date);
		const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		months.add(monthYear);
	});
	
	return Array.from(months).sort().reverse();
}

/**
 * Get posts by month/year
 * @param {Post[]} posts
 * @param {string} monthYear
 * @returns {Post[]}
 */
export function getPostsByMonth(posts, monthYear) {
	return posts.filter((/** @type {Post} */ post) => {
		const date = new Date(post.date);
		const postMonthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		return postMonthYear === monthYear;
	});
}

/**
 * Export all posts (hardcoded + admin) for backup
 * @returns {Promise<Post[]>}
 */
export async function exportAllPosts() {
	const allPosts = await loadPosts();
	return allPosts;
}

/**
 * Import posts (for backup restoration)
 * @param {Post[]} postsToImport
 * @returns {Promise<Object>}
 */
export async function importPosts(postsToImport) {
	try {
		// Separate hardcoded and admin posts
		const hardcodedIds = hardcodedPosts.map(p => p.id);
		const adminPosts = postsToImport.filter(p => !hardcodedIds.includes(p.id));
		
		// Save admin posts to localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('adminPosts', JSON.stringify(adminPosts));
		}
		
		// Reload posts
		await loadPosts();
		
		return { success: true, imported: adminPosts.length };
	} catch (error) {
		console.error('Error importing posts:', error);
		throw error;
	}
}