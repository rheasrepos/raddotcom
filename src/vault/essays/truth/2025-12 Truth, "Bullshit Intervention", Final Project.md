---
title: "Truth, \"Bullshit Intervention\", Final Project"
date: 2025-12-01
date_approx: true
type: essays
academic: true
published: true
affiliation: uchicago
code: https://github.com/nolpozz/PrepostAI
---

Nolan, Rhea, Olivia, Natalie & Julien




Bullshit
Intervention
What is bullshit?
Bullshit is communication that mimics sincere,
truth-based assertion while being indifferent to whether
what is said is true or false, aiming instead at producing
a desired effect [often chaos] on an audience. Unlike
lying, bullshit does not (intentionally) distort the truth—it
disregards it.
Social




How can we avoid falling for bullshit tweets? How
  can we avoid contributing to bullshit online?
What is the solution….?
How could one detect bullshit?

 1.   Given a tweet you are evaluating (let’s call this the “draft”)
      a.   Have an awareness of
             i. The facts of the topic
            ii. What the speaker has asserted is true in the past
      b.   Evaluate the consistency of the “draft” to these two contexts
             i. If the speaker’s truth and what is “factually” true match
                  1. Draft matches contexts = not bullshit
                 2. Draft contradicts both contexts = bullshit
            ii. If speaker truth contradicts “factual” truth
                  1. Draft matches speaker truth: not bullshit (even if false)
                 2. Draft contradicts speaker truth
                       a. but follows “factual” truth: wildcard? not bullshit
                       b. But contradicts factual truth: bullshit

Consistency is essentially how we are evaluating “indifference” to the truth
 ● Is the “draft” random considering what the user believes?
Future Additions/ Ideas
1.   Better context metrics
     a.   Is the user a serial bullshitter/shitposter? Is there alignment across other forms of
          the users’ digital presence (LinkedIn, interviews, papers).

2.   Bullshit score calculator
     a.   Numerical scale displaying a “bullshit value”, visible on every post


3.   Algorithmic implications
     a.   Push posts with lower bullshit scores, higher bullshit scores won’t reach
          audiences

4.   Other forms of media?
     a.   Video, audio, or image bullshit detection technology?
 Implementation: Prepost AI
1.   Checks Past Posts
     a.   Reviews the user previous tweets
     b.   Prioritizes consistency + avoid self-contradictions
     c.   Produces similarity scores




                                  1.




                                2.     Fact Retrieval
                                       a.   Identiﬁes key topics in the draft → pulls info from
                                            trusted sources
Prepost AI
 1.   X
 2.   C




3.    Contradiction Detection (NLI)
      a. Natural language inference to compare the
      draft with veriﬁed facts + user’s history
             i. Flags any contradictions/
                 unsupported claims




4.    Risk Evaluation / Classiﬁcation
          a.   Large language model evaluates all info
               + risk level
                 i. Low / Medium / High
          b.   Explains inaccuracy/risky
          c.   Classiﬁes “bullshit”, “not bullshit”,
               “contextually ambiguous”
Prepost AI
  1.




  2.




  3.




 4.    C




5.     Safer Rewrite
           a.   If needed → the system generates a revised version of the post
                  i. Maximize clarity, accuracy, and minimize misinformation
Video Demo
Questions?
