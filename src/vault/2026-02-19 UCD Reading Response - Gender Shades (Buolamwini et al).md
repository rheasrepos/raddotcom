---
title: UCD Reading Response - Gender Shades (Buolamwini et al)
date: 2026-02-19
type: essays
academic: true
course: User-Centered Design
published: true
source: raddotcom Vault/2026-02-19 Reading Response UCD Buolamwini, Gender Shades.pdf
tags:
  - academic
  - academic/hci
  - academic/hci/user-centered-design
  - reading-response
genre: user-centered-design
---

Rhea Madhogarhia
Reading Response:
Gender Shades: Intersectional Accuracy Disparities in Commercial Gender Classification – Buolamwini
et al
Summary. Main Takeaways: This paper focuses on combatting algorithmic discrimination, emphasizing
that machine learning mistakes in high-stakes areas like legal and medical cases can have serious
consequences. It also seems like the intro and background pointed out worries towards software claiming
to detect mental traits or characteristics (like propensity towards crime or IQ) solely from facial
recognition. In their study, the authors evaluated three facial classifiers (from Microsoft, IBM, and
Face++) and found that all of them performed worse on darker-skinned females. The novelty of this paper
was creating a new, phenotypically balanced dataset called the Pilot Parliaments Benchmark (PPB)
because existing datasets were overwhelmingly composed of lighter-skinned subjects.
Strengths/Weaknesses: One strength is the use of the dermatologist-approved Fitzpatrick skin type scale,
which is scientifically accepted. Still, they admit that even this scale is limited because it is skewed and
biased toward categorizing lighter skin (3 categories). Another strength is that this study doesn't just look
at race or gender in isolation, but examines subgroups like "darker females" or "lighter males". One
limitation is that the new PPB dataset is still relatively constrained, meaning the images of the
parliamentarians are well-lit, front-facing, and high-resolution. Essentially, they aren’t sure that their
results would transfer to the evaluation of more naturalistic images or grainy footage from a surveillance
camera. Questions: One question I have is what barred the researchers from using non-binary labels for
gender classification. I assume that this endeavor would be quite a bit of manual labeling, etc., but I
would have liked to see some more proposed alternatives to the binary system that the models they were
using had. I also felt that the decision to stick to public figures/government officials wasn’t well justified.
I feel like there are many free license stock images that are similarly well-lit, free to use, and clear facial
images that would have granted them a larger dataset.
Reaction. Interesting: I thought the authors' decision to evaluate faces using skin type rather than broad
racial categories was really interesting and a choice that seems intuitive yet still overlooked. Because
racial and ethnic categories are varied across different geographies and encompass a wide variance of
physical features, using the Fitzpatrick skin type scale provided a much more visually precise and
objective labeling system. Another surprising finding was that Face++ classifiers performed best on
darker male faces. This was particularly surprising given that Face++ is headquartered in China, and they
noted that these detectors tend to perform best on the populations they were created around. Finally, I
thought it was cool that they pointed out the uneditable classification thresholds in the models they were
analyzing. It seems odd that companies are making the threshold decisions for the user, rather than them
being able to be fine-tuned. I think this would severely limit a developer's ability to select a trade-off that
is fair and optimized for specific subgroups. Implementation: Overall, I think that this study
demonstrates the need to build genuinely inclusive ML models, especially considering the situations in
which they are used: medicine, criminalization, scientific research, etc. Furthermore, we should be careful
about aggregating performance metrics too much when the model actually performs variably on diverse
parts of a data set. That being said, it’s also important to keep track of what your dataset is representative
of to ensure that the use cases of a specific model are appropriately communicated.
