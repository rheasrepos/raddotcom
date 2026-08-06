---
title: Analyzing the Linguistic Differences Between Spoken and Written Text Using BERT
date: 2025-03
type: research
academic: true
course: CMSC NLP
published: true
source: GitHub wiki (rheasrepos / minalee-research cs257) — also offloaded PDF in Year 4/grad school app stuff/past work/
tags:
  - ai/nlp
form:
  - research-paper
affiliation: uchicago
kind:
  - stub
genre: Research
---
https://github.com/minalee-research/cs257-students/wiki/Analyzing-the-Linguistic-Differences-Between-Spoken-and-Written-Text-Using-BERT

https://github.com/rheasrepos/nlpfinal/tree/final_presentation

NOTE FROM RHEA: some files may not render on this website, please see the above links for the most complete report. 

# Analyzing the Linguistic Differences Between Spoken and Written Text Using BERT

Authors: 
Rhea Madhogarhia, Shivani Puli <br>
Mentor: Karen Zhao

#task #analysis

Code (final_presentation branch) : https://github.com/rheasrepos/nlpfinal/tree/final_presentation 

---
# Abstract
This project analyzes the structural, lexical, and syntactic features that distinguish spoken from written language, focusing on the idea that formality is a key factor in this classification problem. Using BERT and a baseline linear regression classifier, we finetuned models to classify text as either spoken or written and identified linguistic features contributing to this classification. Our baseline model achieved 93% accuracy, while the BERT-based classifier achieved 98% accuracy, showing the effectiveness of a more context-dependent model for capturing subtle or more nuanced differences. Through interpretability analysis using SHAP values and part-of-speech (POS) tagging, we found that spoken text is characterized by conversational markers, pronouns, and interjections, whereas written text tends to be more content-rich, with a higher prevalence of nouns and descriptive adjectives. We then performed misclassification analysis which revealed that formal spoken text, such as possibly scripted educational content or business meeting transcripts, often resemble written language, while informal written text, such as SMS messages, can be misclassified as spoken due to its informal/conversational tone. This misclassification of scripted educational content does not indicate inaccuracy in our BERT model, but rather highlights that much of audio educational content is scripted, resulting in resembling more closely written text. These findings highlight the importance of formality, sentence structure, and domain specific terminology in distinguishing between spoken and written language.

# I. Introduction 

Understanding the differences between spoken and written language is a fundamental problem in NLP. Many NLP models are trained primarily on written text but are frequently deployed in spoken-language applications, leading to noticeable discrepancies in fluency and naturalness. This project aims to systematically analyze how the structural, lexical, and syntactic features of spoken language differ from written language. While differences in formality between written and spoken text are pretty commonly observed, we’re also curious about how varying the formality of our source datasets may have affected our results.

Our main research question is: How well can a classifier differentiate spoken from written language, and what linguistic features contribute most to this distinction? We are interested in how formality levels influence classification accuracy. We anticipate that interpretability testing of our model will reveal that formal language will be more often misclassified as "written". We also expect that text with a more personal narrative will be commonly classified as spoken, but we remain open to whether the model will misclassify such cases. Furthermore, we are interested to see how our model performs on inputs of varying length and sentence structure. By building and evaluating an interpretable model, we aim to gain insights into the linguistic characteristics that distinguish spoken from written text. Our findings will contribute to improving NLP applications that rely on speech-text classification, particularly in areas where interpretability is crucial.

Hence, we will be exploring classifying and analyzing textual data to determine key linguistic differences between spoken and written language. Given a piece of text, our model should be able to classify the text as either originally spoken or written.

Here is an example of our classification task expectations:
### Example 1

**Input text:**  "(g) If both husband and wife would otherwise qualify for the lump sum portion of the grant, such lump sum shall be paid only to the spouse whose lump sum portion yields the higher amount.​ <br>

**Classification Output:** Written (source: UN Docs Dataset) <br>


**Input Text:** " # <Throat_clearing> Did # you all do a lot of organized things like, {F uh, } Little League, {F uh, } # soccer? # "​​​ <br>

**Classification Output:** Spoken (Telephone Conversation Dataset) <br>

This is an example of a classification task that would be easy for our model. Written language tends to use more formal and specialized vocabulary as well as visual structural elements, like bullet points or lettered lists ("(g)"). Much spoken text in the datasets are transcriptions with sound annotations. However, if we were to remove punctuation and formatting, is it as easy to distinguish the difference or are there more subtle differences that contribute to classification that we do not see in this example? For example, what happens when we strip these examples of punctuation?

Here is a less obvious classification example:

### Example 2

**Input text:**  it is both a great honour and a pleasure to take part in the work of the United Nations General Assembly for the first time and to address such a distinguished gathering at a time when the Organization has regained its vitality and its prestige​ <br>

**Classification Output:** Spoken (source: UN Debates Dataset) <br>


**Input Text:** the findings presented in the report underscore the critical importance of fostering interdisciplinary collaboration to address emerging challenges in technological innovation and policy development​ <br>

**Classification Output:** Written (UN Docs Dataset) <br>

Both of these examples are formal and contain specialized vocabulary. Running SHAP analysis, which we will discuss more later, on these two examples, we find that the model misclassifies the spoken example as written; the words that contributed the most to the "written" classification in both examples tend to be proper nouns (like "United Nations General Assembly") and nouns or adjectives commonly used in a UN context ("report", "interdisciplinary", "findings"). 

This example highlights that written vs. spoken text classification is a non-obvious task. 
Our further interpretability analysis aims to identify features of both spoken and written text that contribute to both the misclassification and accurate classification of text as either spoken or written. As we've just noticed, differentiating text as spoken or written when they belong to the same domain/category is difficult. We intentionally found pairs of datasets belonging to the same topical domain that differed in modality (spoken vs. written). In the next section, we will discuss how and why we chose the specific training datasets we did.  
 
# II. Data and Preprocessing
To train and evaluate our model, we used publicly available datasets that include both spoken transcriptions and written text across different formality levels. We chose datasets with differing formality levels because we know that a common assumption is that spoken text is more informal than written text. We wanted to ensure that this wasn't the only distinction we were uncovering, so we found written and spoken sources that ranged from informal to neutral to formal. 

As part of our preprocessing, we will assign categorical tags to each text sample to indicate its formality level. We will also add a second tag for our independent variable indicating whether or not the text is written or spoken. To ensure that our model does not develop biases based on dataset size or formality level, we will sample a roughly equal number of points from each dataset. This will prevent overfitting to larger corpora and ensure balanced representation across different spoken and written sources.

| **Category**                                | **Spoken/Oral Source**                                    | **Written Source**                                  |
|---------------------------------------------|-----------------------------------------------------------|-----------------------------------------------------|
| **Formal Speech vs. Formal Essays**         | UN General Assembly Speeches (7.5k speeches)             | Official UN Translated Documents (20m translations) |
| **Formal Speech vs. Formal Essays**         | Educational Podcast (around 116k words/ep)               | Medium Articles (190k articles)                     |
| **Business Speech vs. Business Text**       | Business Meeting Transcripts (5.17k train audio transcripts) | Enron Emails (250k emails)                  |
| **Conversational Speech vs. Informal Text** | Switchboard Dialog Corpus (122k utterances)              | SMS + Chat Dataset (5700 chats)                     |
| **Academic Lectures vs. Educational Writing** | Khan Academy Transcripts (7.73k transcripts)          | Educational Webpages/Textbooks (5.52m entries)     |

To create a balanced dataset, we selected a subset of data from each of these 10 datasets. Specifically, 300 samples are drawn from ds_un_docs, ds_edu, ds_medium, ds_enron, ds_khan_edu, ds_business_meetings,  ds_un_debates, and ds_telephone_convos. Since SMS messages are typically shorter, 400 samples are taken from ds_sms to ensure sufficient text volume. Conversely, only 100 samples are taken from ds_podcast_news because podcast transcripts are generally longer/contain an entire episode's worth of utterances. Similarly, for our test dataset, we selected 30 samples from each of these categories, and 20 from the podcasts dataset. 

Each dataset underwent preprocessing tailored to its specific content's quirks. For UN documents, only the English text was extracted. In Medium articles, the first and last sentences are removed to avoid author information, links, citations, or summaries. Enron emails are cleaned by removing the "Subject:" line, initial boilerplate text, and formatting symbols such as equals signs that we found showed up in some of the original dataset. In business meeting transcripts, speaker labels are stripped out. Khan Academy transcripts are cleaned by removing timestamps and all-caps speaker names. Overall, we wanted the context to exclude non-semantic formatting giveaways that made it clear that a piece of text was written or spoken.

After preprocessing, the datasets are combined into two main categories (as demonstrated by the table above): "written" and "spoken". Written datasets include UN documents, Medium articles, textbooks, SMS messages, and Enron emails, labeled with the "type" value of "written." Spoken datasets consist of podcasts, UN debates, Khan Academy transcripts, telephone conversations, and business meetings, labeled as "spoken." These two categories are merged into a single dataset called full_dataset, which is shuffled to ensure randomness.

The combined dataset then went through additional preprocessing. We removed all HTML tags, URLS, punctuation, stopwords, extra spaces, and non-alphabetical values before finally converting all text to lowercase. We decided to conduct a rigorous preprocessing so that our classification model would capture the true essence of the linguistic differences between the two categories rather than picking up on flags that indicate the source dataset. We then added a label category with values "written" and "spoken" to prep our data for classification. Once preprocessing was complete, the final dataset and test dataset were saved in CSV files.

In total, the training dataset consists of 2309 samples, the validation dataset contains 568 samples, and finally, the test dataset contains 260 samples.

### Processed Dataset Visualization

![983774c2-2067-4ab8-95e1-5c57df41a068](https://github.com/user-attachments/assets/eeb28c6a-db6d-4124-a0ee-520edc1191d3)
![ed7ea06c-c353-47de-b3cc-43c6b6150e92](https://github.com/user-attachments/assets/ccc775a4-299b-4973-9707-9169976cf54d)

As part of our preprocessing, we examined the most frequently used words in both spoken and written text to identify key lexical differences between the two modalities. Our dataset revealed that spoken text had a larger vocabulary size compared to written text. This suggests that spoken language exhibits greater lexical variety, likely due to its spontaneous and informal nature, whereas written language tends to be more structured and precise.

An analysis of the most frequent words in spoken text highlights its conversational and interactive style. Words such as "like", "think", "know", "people", and "one" dominate the "spoken" dataset, many of which serve as discourse markers or cognitive verbs that indicate hedging, uncertainty, or engagement with an audience. Additionally, pronouns such as "you," "I," "we," and "they" appear frequently in speech, reflecting its inherently personal and dynamic nature. In contrast, the most frequent words in written text include "also", "book", "time", "data", and "new", terms that emphasize information delivery, structure, and content-driven communication rather than interaction. The "written" dataset shows a higher prevalence of nouns and analytical terms, indicating a preference for abstraction and clarity over the immediacy and expressiveness characteristic of spoken discourse.

Interestingly, there is some overlap in commonly used words across both spoken and written text, with words like "one," "people," and "would" appearing frequently in both. However, the contexts in which these words are used may differ significantly, reinforcing the notion that spoken and written language differ not only in word choice but also in their underlying syntactic and rhetorical structures. By identifying these distinctions, we ensure that our model captures the fundamental linguistic characteristics that differentiate spoken and written text, rather than relying on superficial cues that may be dataset specific.

![piecharts](https://github.com/user-attachments/assets/a2cf9e72-45cc-4061-b9b7-db0e17326e2a)

Furthermore, as illustrated in the pie charts shown above, we were able to chart the POS (parts of speech) breakdown of each formality and text type category within our datasets. Already, before looking at model outputs, we can see some obvious differences. Rows represent data with the same formality type and columns represent data with the same text type (written or spoken). We are most interested in the differences between columns. Consistently, we see that written text is made up of a higher percentage of nouns whereas spoken text is made up of a higher percentage of adverbs and verbs (except in the formal category). The greater density of nouns in written text may suggest that written text conveys more information than spoken text; spoken text may be more filled with filler, transitions, or modifying/qualifying verbs (like "very"). 

Overall, the warmer toned colors in these pie charts (PRON - pronouns, CONJ - conjunctions, PART - particles), seem to be more present in the "spoken" column than the "written" column. The only chart within the "written" column that rivals the diversity of POS in the "spoken" column is informal written text. This observation supports the common belief that spoken text is more informal; it would make sense that spoken text of almost any formality is more closely related to informal written text than any other degree of formality of written text. Still, we aim to find out whether or not the differences within spoken and written text extend beyond informality.

# III. Model 1: Baseline Linear Regression Classifier


### a. Baseline model
We chose to use the baseline model of a linear regression classifier using a simple bag of words embedding model. We predict that text classification can be partially, but not entirely, explained by word usage. Thus, the bag of words model would be a good baseline test for this classification problem.

### b. Results

| **Category**      | **Precision** | **Recall** | **F1-Score** | **Support** |
|------------------|------------|--------|----------|---------|
| **Spoken**       | 0.90       | 0.99   | 0.95     | 320     |
| **Written**      | 0.99       | 0.86   | 0.92     | 248     |
| **Accuracy**     |            |        | 0.93 | 568     |
| **Macro Avg**    | 0.95       | 0.93   | 0.93     | 568     |
| **Weighted Avg** | 0.94       | 0.93   | 0.93     | 568     |

![4961978d-00f3-4963-9f47-fb256c3c4f0b](https://github.com/user-attachments/assets/816d5414-c2c5-41e4-a99a-81e7013586b8)

### c. Analysis
Our baseline regressor achieved a 93% accuracy, supporting our hypothesis that word frequency contributes to the distinction between spoken and written language. However, its 86% recall rate on spoken text indicates a high false positive rate, meaning formal spoken language is often misclassified as "written". This aligns with our expectation that formal spoken text shares similarities with written text, making it harder to differentiate.
The t-SNE visualization of the TF-IDF baseline model further illustrates this challenge. While Logistic Regression captures some patterns, it struggles to clearly separate spoken and written text. Clusters of spoken text appear within written text, suggesting that certain spoken samples have word distributions similar to written text. Although some separation exists, the boundary between spoken and written text remains blurry. While TF-IDF highlights some linguistic differences, it evidently cannot fully capture syntactic and semantic relationships, especially in audio speech transcripts that resemble written language.

# IV. Model 2: BERT Embedding Model 

### a. Embedding & Training
We then used HuggingFace's pretrained "bert_base_uncased" embedding model to create embeddings for the combined dataset. Then, using Wandb.AI's training interface, we created a BERT embeddings classifier model using the following parameters:
1. Learning Rate: 5e-5
2. Weight Decay: 0.01
3. Batch Size: 16
4. Embedding Size: 128
5. Hidden Layer Size: 768
6. Training Data Size: 2309
7. Evaluation Data Size: 568
8. Epochs: 5

### c. Model Performance

The resulting training valuation we received was the following: <br>
<p align="center">
   <img src="https://github.com/user-attachments/assets/8372a58b-a081-4553-b585-48bcbb073b81" width="700" align="center">
</p> 

<p align="center">
  <img src="https://github.com/user-attachments/assets/08fcff79-a260-431a-a7a8-f7740739a37f" width="400">
  <img src="https://github.com/user-attachments/assets/8d6f3141-91b0-438a-bbda-d310eb77a539" width="400">
</p>


# V. Model Interpretation
The following model analyses are conducted using the test_dataset to ensure in order to test the model's accuracy on unseen data.

### a. Example Sentences
**Text:** Divorce, or judicial separation, is governed by the Matrimonial Causes Act and the Subordinate Courts (Maintenance and Separation) Act, but these acts are only applicable to civil, Christian and Hindu marriages.

**Predicted Class:** "written"


**Text:** Our delegation worked very closely with Mr. Deiss, and we can testify to his exceptional commitment to the United Nations and his immense capacity for work

**Predicted Class:** "spoken"

The second example in our introduction highlighted a potential issue: our model's inability to classify formal presentation texts as spoken. However, the example above addresses this concern by demonstrating that even when two texts share the same topical domain and similar levels of formality, there are still inherent differences that allow the model to distinguish between them modally. Our model's accuracy and outperformance of the baseline regressor model is further confidence that subtle but inherent differences within spoken and written text exist. Later in this section, we will perform a SHAP analysis on several test examples to gain deeper insight into how our model makes its classification decisions.


### b. T-SNE Visualizations
![tsne](https://github.com/user-attachments/assets/9c6928cd-c212-4dc7-8daf-ba3b910967dc)

The t-SNE visualization of the BERT model embeddings demonstrates a much clearer separation between spoken and written text compared to the baseline TF-IDF model. Unlike the scattered clusters observed in the logistic regression baseline, BERT embeddings exhibit distinct groupings, suggesting that the model successfully captures deeper linguistic structures beyond simple word frequency. The spoken text embeddings are more tightly clustered, indicating consistency in their linguistic features, while written text forms a separate, well-defined cluster. The minimal overlap between categories highlights BERT’s ability to leverage contextual relationships and syntactic structures to distinguish between spoken and written language. However, we still observe a few misclassified points where spoken text appears in the written cluster and vice versa. These misclassifications suggest that some formal spoken language resembles written text, making it difficult for the model to distinguish between them. In our further analysis, we will investigate these misclassified cases to understand which linguistic features contribute to errors and explore potential refinements to improve classification accuracy.


### c. Accuracy across Levels of Formality
<img width="262" alt="Screenshot 2025-03-08 at 4 37 24 PM" src="https://github.com/user-attachments/assets/4c48ef30-a203-4356-9319-929e371511f5" />

Low Accuracy in Spoken Educational Text:
The model has a dip in performance when trying to accurately classify spoken educational text, especially from the Khan Academy dataset. However, rather than highlighting a flaw in the BERT model, this seems to indicate how scripted educational videos can be, resulting in language that is more similar to written lexical style than spoken. A study by Kristopher and team found that students often struggle to engage with video lectures because they lack the interactive, spontaneous features of traditional classroom lectures. Educational videos, despite being delivered orally, often adopt a structured, scripted style that more closely resembles written text. This effect seems to be underscored here in our classification task. Formal spoken educational content is often misclassified as written because it lacks the conversational markers and informal structures characteristic of natural spoken dialogue. This suggests that our model is not simply struggling with classification but is instead revealing underlying structural similarities between scripted speech and written language.

To further explore this, we plan to analyze misclassified cases through SHAP visualizations and parts-of-speech distributions to determine which linguistic features contribute most to these errors. By comparing these findings to naturally occurring spoken transcripts, we aim to distinguish between features inherent to spoken language and those that emerge from structured, formalized speech.

Low Informal Accuracy:
The model also has trouble with informal text, both spoken and written. Informal language may be trickier to classify than formal language because it’s so varied—full of slang, abbreviations, and casual phrases that the model doesn’t always catch. Informal language often lacks clear grammatical structure, punctuation, and capitalization, making it difficult for a model trained primarily on more structured data to classify correctly. Additionally, informal written texts, like SMS messages, are often short and lack the depth of longer texts, providing less context for the classification model to interpret. 

Formal Spoken Text Misclassified as Written:
The model frequently misclassifies formal spoken text, such as business meetings or corporate speeches, as written text. This is likely because formal speech often mirrors written language in both structure and word choice. Unlike casual conversation, which is marked by spontaneity, informal phrasing, and discourse markers like “um” or “you know,” formal spoken language tends to be carefully structured, grammatically precise, and content-driven. The presence of domain-specific jargon and technical terminology further blurs the distinction between formal speech and formal writing. Since the model learns to distinguish spoken and written text based on stylistic and syntactic differences, formal speech—which lacks the fluidity and disfluencies of natural conversation—closely resembles written language. As a result, the model struggles to separate the two, leading to higher misclassification rates for formal spoken text.

### d. SHAP Interpretation

<img width="1109" alt="Screenshot 2025-02-25 at 5 03 46 AM" src="https://github.com/user-attachments/assets/84d06ebf-a4b5-4a00-9fba-ea6e8af44bbf" />
<img width="1110" alt="Screenshot 2025-02-25 at 5 04 22 AM" src="https://github.com/user-attachments/assets/30a931eb-5f46-4da8-8bba-15536cdf8237" />
<br> The two images above show extracted SHAP values for two pieces of text. The top example is a written example from the UN documents dataset and the bottom example is a spoken example from the UN Debates dataset. Our model correctly classified this untrained data as spoken and written, respectively. SHAP values help us take a look into how the model reached its classification decision by measuring each word in the text's contribution to the model's decision. In the plots above, the blue left pointing graphics show words that had a negative contribution to the classification. Conversely, the pink/red words are words that positively contributed to the classification decision.


If we look at the top example (written text), we see that the red highlighted words are "Divorce", "acts", "are, and "applicable" whereas the most impactful blue highlighted words are "but", "these", and "or". The red highlighted words seem to be words that carry more meaning with them, rather than being structural words. This seems to suggest that spoken language contains more filler words like "but" and "or" compared to context-heavy language. This aligns with the indicated positively contributing words, like nouns and action verbs. 

If we take a look at the bottom spoken example, we see this trend again - pronouns (our, mr, we) and transitions (and) positively impacted the classification as "spoken" whereas action verbs (work, worked) made the classification lean more towards "written". Interestingly, in this example, "very closely" is highlighted blue, which advances another question/hypothesis: does written language generally use more adjectives/ is written language more descriptive than spoken language? Our misclassification analysis suggests yes. 

### e. Misclassification Analysis (SHAP & POS)
We encountered 10 misclassification examples on our test dataset which we ran SHAP analysis on and also extracted the top 50 or less most frequent words in each misclassification category (true label "spoken" with predicted label "written" or true label "written" with predicted label "spoken"). Below is a chart that represents the most frequent words in misclassified data entries.

| label | predicted_label | top_words |
|-------|-----------------|-----------|
| 0 (written)   | 1 (spoken)               | [thursday, night, yeah, sure, thing, well, work, never, nothing] |
| 1 (spoken)    | 0   (written)            | [species, like, biodiversity, climate, islands, important, air, ecosystems, summary, ecosystem, much, iiwi, north, average, latitude, south, map, many, hawaiian, ocean, places, mountains, lets, equator, degrees, get, temperatures, text, kind, think, higher, example, net, climates, regions, first, lower, dry, cools, year, detail, might, warm, place, also, one, often, half, land, pacific] |

Content-wise, we realize that the high frequency of some of these words, and their topical similarity, could be because some text entries are lengthy and educational about a certain topic. So, to abstract the contributions that these words made to the misclassification decision, we plotted the frequency of the parts of speech present in the "top_words" column. 

<img src="https://github.com/user-attachments/assets/a8ea9566-63ee-4a3e-bbfc-9afda74c8071" alt="download-8" width="500" />
<img src="https://github.com/user-attachments/assets/5b410c61-4b96-4cfc-a0bc-e90b526e425b" alt="download-9" width="500" />

Legend: 

![1_nYQCGUkr47eW3OmeV6Zgtg](https://github.com/user-attachments/assets/a4e910f5-2bf6-442f-a005-86524a18e92d)

Why did our model misclassify these text entries? 

First, looking at the specific words in the top row of the top_words column from the table above, we see that the words present are relatively simple words that are used in everyday conversation. Words like "yeah", "sure", "well", and "thing" all tend to be domain-ambiguous/more general, shorter, and simpler words. Furthermore, subjectively extracting themes from this list of words, we notice that these words fit in very casual and conversational contexts (making plans, stating opinion, conversational reactions, etc). Referencing the pie chart, we also see that these words are mainly interjections, adverbs, and nouns. Interestingly enough, only 20% of all misclassified samples in this small test dataset were misclassified as "spoken", and both of these examples were SMS messages that were mistaken for spoken text. Interjections being a prominent part of this classification supports the idea that spoken text may be more expressive.

<img width="700" alt="Screenshot 2025-03-10 at 4 44 54 AM" src="https://github.com/user-attachments/assets/d1ff4173-0282-4435-aa86-f249202dad27" />


Looking closely at the SHAP values of one of these misclassified examples, we see that the two words that contributed most to the misclassification as "spoken" were "well", "yeah", and "sure". The words that were contributing the most to classifying this example as its true label, "written", were "thursday" and "work". This example demonstrates the aforementioned findings: interjections and adverbs are more characteristics of spoken text whereas content-rich words (nouns and verbs) were more characteristics of written text. Still, SMS messages tended to be the shortest in length, so longer SMS messages were more likely to be misclassified due to the lack of context present compared to other sources during training. Overall, this highlights that our model expects spoken text to be, expectedly, informal, but also less domain specific, more ambiguous/general in meaning, shorter in length, and less complex.

Next, looking at the bottom row of the top_words column, we see a slew of mainly nouns, adjectives, and verbs that are semantically scientific, academic, educational, and generally more complex than the row of words above them. These misclassifications came from three source types: khan_academy, telephone_convos, or business_meetings.

<img width="1338" alt="Screenshot 2025-03-10 at 5 04 37 AM" src="https://github.com/user-attachments/assets/f13c6b82-f727-4f89-a05d-143fd130bd54" />
<br> In the SHAP value analysis for a business_meeting text that was misclassified as "written", we see business terminology highlighted in red, indicating a positive contribution for classification.  Furthermore, we can see that longer and more complex words tend to contribute positively to a "written" classification outcome. Nouns present in this example are relatively technical, but, this example **also** has descriptive words like "annual", "public", "collaboratively", and "advisory" that are both domain specific and content-rich. Given that khan_academy sourced texts were also commonly found in the misclassification set, and that khan_academy videos can be scripted and have an informational/educational purpose, it makes sense that khan_academy texts would be misclassified as "written". Additionally, more informational texts may be devoid of expression but full of description and detail.


# VI. Conclusion
In this project, we explored linguistic differences between spoken and written text using BERT and a baseline linear regression classifier. Our goal was to accurately distinguish between spoken and written language and then analyze and identify the key features that contribute to this distinction. By leveraging datasets spanning various formality levels and doing extensive and tailored preprocessing to each dataset, we were able to create a diverse dataset of labeled written and spoken texts.

Our baseline bag-of-words model achieved an accuracy of 93%, while the BERT-based classifier achieved 98% accuracy, demonstrating the robustness of both approaches. The BERT model, in particular, provided deeper insights into the syntactic and semantic differences between spoken and written language. Our preliminary SHAP analysis revealed that spoken text is characterized by conversational markers, pronouns, and interjections, while written text tends to be more content-rich, with a higher prevalence of nouns and descriptive adjectives.

The misclassification analysis highlighted that formal and informal spoken text, such as scripted educational content or telephone conversations, often resemble written language due to domain specificity among other previously mentioned factors, leading to classification errors. Conversely, informal written text, such as SMS messages, was sometimes misclassified as spoken due to its conversational tone. These findings suggest that while formality plays a significant role in distinguishing spoken and written language, other factors such as sentence structure, lexical variety, and domain-specific terminology also contribute to the classification.

This findings are important and particularly relevant in the context of ethical considerations in natural language processing. As we initially mentioned in our project proposal, many publicly available NLP datasets, including those used in this project, are often skewed toward speakers who are white, American, and highly educated. This lack of representation of diverse speech patterns can perpetuate biases in AI-driven communication systems, such as chatbots, customer support bots, and voice assistants. By analyzing the linguistic differences between spoken and written language and making sure to account for varying levels of formality in our training data, our project underscores the importance of developing more inclusive and robust datasets that encompass a broader range of racial, regional, and dialectical variations. Addressing these biases is critical to ensuring that AI models do not reinforce linguistic disparities and are better equipped to serve diverse populations. Our findings contribute to this ongoing conversation by providing insights into the features that distinguish spoken and written language that go beyond formality (a culturally subjective measure), which can inform future efforts to create more representative and equitable NLP systems.


Finally, while we could aim to continue to improve on our findings through altering our preprocessing more, interpreting SHAP values differently, or finetuning our model more, we were able to train an accurate classification model and analyze its decision process through its misclassifications and SHAP values. Overall, it seems as though written text is more meaningful, content-rich, descriptive, and formal, whereas spoken text is more casual, general, expressive, and informal. 

# VII. Addendum
What happens when the dataset is not properly preprocessed?

In this section, we will take a look at our first attempt at this BERT classification model, where we did not remove punctuation, stopwords, or other non-alphabetical values from the dataset. We got the following results: 

| **Loss** | **Accuracy** | **Precision** | **F1-Score** |
|--------|--------|--------|--------|
| 0.293    | 0.93    | 0.938     | 0.929     |

Here are visual representations of these results:
<p align="center">
  <img src="https://github.com/user-attachments/assets/7a9a9caa-f9d0-4280-8d91-cc711e836087" width="300">
  <img src="https://github.com/user-attachments/assets/bc4488b4-2edc-44e0-ab0e-71214e68b321" width="300">
  <img src="https://github.com/user-attachments/assets/6875d1d2-0f11-45df-aa0b-e0269dfe98b0" width="300">
</p>


We can see that accuracy reaches its peak of around 93%, suggesting that these extra punctuation and words were likely irrelevant features that created noise in the model. This led us to redo our classification model with more rigorous preprocessing, which led us to an accuracy of 98%!

# VIII. Further Improvements
While our preprocessing pipeline successfully removed many extraneous formatting elements, there remains potential for even deeper linguistic analysis by refining our approach. Our processed dataset has already revealed a stark contrast between content-heavy words in written text and conversational markers in spoken language. However, these distinguishing features may themselves act as surface-level indicators, preventing us from uncovering more nuanced syntactic and semantic differences. If we further refined preprocessing to remove common discourse markers in speech such as "like," "you know," and "right" and high-frequency content words in writing such as "data," "information," and "new," we could better isolate the structural and grammatical patterns that differentiate the two modalities. By stripping away these explicit indicators, we might be able to reveal underlying linguistic tendencies such as sentence complexity, verb structure, or information density, leading to a more precise and interpretable analysis of spoken and written text. Future work could explore these refinements to further enhance the depth and accuracy of our linguistic comparisons. Still, as per feedback given in class memos, we retained common discourse markers in our dataset. 
Another improvement to our preprocessing and dataset choices would be controlling for sentence or entry length. Some entries were extremely long while others were only a few words. In our misclassification test set, text had been preprocessed to be less than 512 words, which is still quite long and still allows for considerable variation in input size. It would be interesting if every text entry was only a single sentence long.

On the other hand, the SMS dataset provided many brief and informal rows of text. Many SMS messages are short, often lacking sufficient context for the model to accurately classify them. To address this, future work could focus on filtering the SMS dataset to include only longer messages, ensuring that each training sample provides enough context for the model to learn meaningful patterns. By equalizing the amount of context across training samples, we could reduce misclassifications caused by insufficient information. Alternatively, we could explore techniques to augment short texts with contextual information or we could test whether combining multiple short messages into a single sample could further improve the model's performance on informal written text.

Additionally, the SHAP analysis on business texts revealed that the model might be relying heavily on domain-specific language to classify text. This could lead to overfitting, where the model performs well on the training data but struggles to generalize on unseen data. To mitigate this, future work could involve training the model on an even more diverse and larger dataset, encompassing a wider range of domains and speech patterns. This would help ensure that the model generalizes better to unseen data and reduces its reliance on domain-specific cues. Still, we do believe that our model was being run on a somewhat domain-diverse                                                                                                                                                                                                                                                                                                             dataset given that podcasts, khan_academy, and textbooks all had samples that covered many different domains.

By addressing these improvements, we can enhance the robustness and generalizability of our model, ensuring that it performs well across a wide range of linguistic contexts and domains.

# References
Kristopher K., Ann T.C., Masaki E. A comparison of spoken and written language use in traditional and technology-mediated learning environments. In ETS Research Report Series, 2021.

Our Kaggle website with our project draft:
https://www.kaggle.com/code/spuli2002/nlpfin
## Topics
- [[Topic - ai]]
- [[Topic - ai · nlp]]
