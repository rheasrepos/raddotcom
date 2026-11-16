# Open tools idle, closed tools vanish

The Al-Nabki et al. file-name/path classifier is **not** an open-source tool going unused. It is **published but closed**: the paper links no code, weights or data, because the positive-class training data came from Spanish law enforcement and cannot legally be shared ([ar5iv 2011.01113](https://ar5iv.labs.arxiv.org/html/2011.01113)). Its only delivery vehicle, INCIBE's 4NSEEK tool, is **deployed then abandoned**: it went to police forces only, and INCIBE now states it "is no longer supported" ([INCIBE](https://www.incibe.es/en/incibe/corporate-information/who-we-work-with/european-projects/4nseek)). Across all six problem areas the same split recurs. Predictive models built on sensitive data stay closed and end with their grant or their operator. Open artifacts that go unused are mostly research prototypes with no maintainer, no operator, or a licence that blocks real use. Open tools that are used almost always have a named organisation running them. The measured base rate is stark: 71% of Hugging Face models had zero downloads in October 2023 ([Osborne et al.](https://arxiv.org/html/2405.13058v1)), and about 64% of 18,244 scientific repositories were inactive by 2023 ([SciCat](https://arxiv.org/pdf/2504.18971)). No existing tracker records deployment as a measured field, and no source in these notes gives a deployment rate for academic tools in any of the six areas. That missing field is the gap your two datasets can fill.

## How to read the labels and limits

Every row carries a verification label from the research notes. **V** means verified in a fetched page or a cloned repository. **S** means seen only in a search-result title. **U** means UNVERIFIED background knowledge, a lead and not a fact. "Not found" means searched without result, which is not proof of absence. "Not researched" means nobody looked. Fetched pages were read through a model-generated extraction, so re-check any quotation against the original before printing it as verbatim.

Three limits apply throughout. GitHub's web UI and API were blocked, so **no archived flags or star counts were read directly**; last-commit dates exist only where a repository was cloned (shelter, wage, language) or a mirror reported them. The claims about Al-Nabki et al. were researched from its arXiv preprint and then checked against the Scientific Reports 2023 version attached to this conversation. The journal version agrees: its data-availability statement says the non-CSEM class is available on request and the CSEM file names "cannot be shared", it links no code of its own, and it states the framework was integrated into a forensic tool used by a Spanish police force under 4NSEEK. "Unused" is never observed directly; it means no public evidence of use was found.

The four requested cases are: **Open, unused**; **Deployed, abandoned**; **Closed** (published but closed); **Open, used**. Several tools fit none of these, so the tables also use **Closed, deployed**, **Open, research-only**, **Open, licence-restricted** and **Not open by choice**.

## Child safety: the open layer is plumbing, the classifiers are closed

Open code in this field is infrastructure for matching known content and running moderation workflow. Classifiers for novel abusive imagery are published as papers or services, never as open weights, because the training data is illegal to hold. The notes found no open-weight classifier of that kind. The best-supported "open and unused" examples are two grooming-detection text models trained on decoy chat logs, both carrying their authors' own warnings against real use.

| Tool | Case | Released and licence | Deployment evidence | Maintenance | Documented barrier | Source (label) |
|---|---|---|---|---|---|---|
| Al-Nabki et al. file-name/path classifier (Univ. León) | Closed | Paper only; no code, weights or data | Delivered as a 4NSEEK module | Follows 4NSEEK (unsupported) | No public positive-class data; collecting it is illegal; data supplied by police via INCIBE | [ar5iv](https://ar5iv.labs.arxiv.org/html/2011.01113) (V preprint; V journal version, attached paper) |
| 4NSEEK forensic tool (INCIBE) | Deployed, abandoned (closed, police-only) | Software distributed to police via INCIBE's platform; no licence stated | Police in 28 countries had access, per an undated page | "No longer supported"; project ran Jan 2019 to Jun 2021; notice date not found | Police-only gating; EU project funding ended | [INCIBE project](https://www.incibe.es/en/incibe/corporate-information/who-we-work-with/european-projects/4nseek), [tool page](https://www.incibe.es/en/incibe/corporate-information/who-we-work-with/european-projects/4nseek/tool) (V) |
| Meta HMA 1.0 | Deployed, abandoned (open) | Code, BSD | One unnamed AWS-based industry partner | Archived Mar 2024; rewritten as HMA 2.0 | Hard AWS dependency "kept some potential users from deploying it" | [HMA history](https://facebook.github.io/ThreatExchange/hma/history.html) (V) |
| Vogt et al. grooming models (ACL 2021) | Open, unused | Code, trained models, dataset-build scripts; no licence stated | None found | No maintenance information | Authors: "not ready for real-world use" | [project site](https://early-sexual-predator-detection.gitlab.io) (V) |
| chatcompanion/compAnIonv1 | Open, unused | Weights, MIT | None found; 1 like | README untouched 2+ years | Student capstone; misclassification harm; English-only | [model card](https://huggingface.co/chatcompanion/compAnIonv1/blob/main/README.md) (V) |
| ROOST Osprey | Open, used | Code, Apache-2.0 | Bluesky (over 50M events/day), Discord, Matrix.org Foundation | Active; v1.0 on 28 Jan 2026 | n/a | [ROOST](https://roost.tools/blog/introducing-osprey-v1-0-open-source-infrastructure-for-real-time-abuse-mitigation/) (V) |
| ROOST Coop | Open, used | Code and Docker images; licence not found | Kyodo; one unnamed adopter (self-reported) | Active; v1.0 on 9 Jun 2026 | n/a | [ROOST](https://roost.tools/blog/coop-1-0-world-s-first-free-open-source-child-safety-infrastructure-for-every-platform/) (V, vendor-reported) |
| Meta PDQ, TMK+PDQF, vPDQ | Open; use not verified | Code, BSD; hash lists not included | PDQ deployers U; video hashes not found | Listed in active README; commit dates not checked | Hash lists are access-controlled | [README](https://cdn.jsdelivr.net/gh/facebook/ThreatExchange@main/README.md) (V release; U deployers) |
| Meta HMA 2.0 / Open Media Match | Open; use not found | Code, BSD | Not found | README says "under construction" | No GUI; needs external hash-list access | [HMA history](https://facebook.github.io/ThreatExchange/hma/history.html) (V existence) |
| Pereira et al. (Microsoft) metadata detector | Closed | Paper; abstract mentions no release | Not found | Not found | Not found | [arXiv](https://arxiv.org/abs/2010.02387) (V, abstract only) |
| iCOP (Peersman et al. 2016) | Closed | Paper; code availability not stated | Trials with officers; operational use not stated | Not found | Not found | [Bristol](https://research-information.bris.ac.uk/en/publications/icop-live-forensics-to-reveal-previously-unknown-criminal-media-o/) (V) |
| DeepPatrol (URI, NIJ-funded) | Closed | Nothing public | None stated | Status after Dec 2021 not found | 39 hours per ~1M-file case; court-reliability evaluation pending | [NIJ](https://nij.ojp.gov/topics/articles/improving-collection-digital-evidence) (V) |
| EU GRACE (grant 883341) | Closed | Reports and papers; no tool named on CORDIS | None stated on CORDIS | Closed 30 Nov 2023; cost EUR 6,824,012.50 | Not found (results-in-brief not read) | [CORDIS](https://cordis.europa.eu/project/id/883341/results) (V) |
| FileTSAR (Purdue, NIJ-funded; general forensics) | Gated; failed verification | Free licence to agencies | Licensed to 120 agencies; at least 30 implemented; 90 unknown | Failed NIJ verification, Jul 2022 | Could not be installed or verified; legal exposure for users | [NIJ report](https://nij.ojp.gov/library/publications/verification-report-toolkit-selective-analyses-reconstruction-files-filetsar) (V) |
| Thorn Safer Predict; Cloudflare CSAM Scanning Tool | Closed, deployed | Closed services | X beta-tested Thorn's text model; Cloudflare adoption up 1,600% after Feb 2025 | Active | Earlier Cloudflare barrier: reporting-credential step | [Thorn](https://www.thorn.org/press-releases/thorn-launches-safer-predict-a-proactive-ai-detection-solution-to-scale-child-safety-on-content-hosting-platforms/), [Cloudflare](https://blog.cloudflare.com/a-simpler-path-to-a-safer-internet-an-update-to-our-csam-scanning-tool/) (V) |

Industry uptake follows tool maturity. A 2021 survey of 32 companies found **87%** used image hash matching, 56% image classifiers and 37% grooming detection; the top stated barrier was time and bandwidth (46%), while lack of leadership buy-in scored 0% ([WeProtect](https://www.weprotect.org/wp-content/uploads/Survey-of-technology-companies-2021.pdf)). A 2023 Tech Coalition member survey reported 89% using an image hash-matcher and 57% a classifier ([Tech Coalition](https://technologycoalition.org/resources/update-on-voluntary-detection-of-csam/)). Both samples are coalition members and overstate adoption among small platforms. Grooming detection has the most open academic artifacts and the lowest uptake.

The cleanest natural experiment is Cloudflare's: removing one non-technical step, the requirement that site owners supply their own NCMEC credentials, raised monthly adoption **1,600%**. That is a relative figure with no absolute count ([Cloudflare](https://blog.cloudflare.com/a-simpler-path-to-a-safer-internet-an-update-to-our-csam-scanning-tool/)).

**No source gives a count or percentage of academic child-safety systems that reach deployment.** The available evidence is anecdotal and negative. Not found: any Thorn open-source release, who runs HMA 2.0 in production, whether any police force still runs 4NSEEK. Not researched: open age-estimation models, cyberbullying classifiers and their datasets. PhotoDNA facts are UNVERIFIED.

## Five more problems: operators decide survival, not licences

The table below uses the same columns with a Problem column added, so rows can be imported as they stand.

| Problem | Tool | Case | Released and licence | Deployment evidence | Maintenance | Documented barrier | Source (label) |
|---|---|---|---|---|---|---|---|
| Climate | ecmwf-lab/ai-models runner | Open, unused | Code, Apache-2.0 | None; README says do not use operationally | Archived; date not found | Unmaintained; some model weights non-commercial | [README](https://github.com/ecmwf-lab/ai-models/blob/main/README.md) (V) |
| Climate | Pangu-Weather, original GraphCast, FourCastNet v1/v2 | Deployed, abandoned (open) | Code and weights; licences U | Ran in ECMWF's real-time suite | ECMWF stopped the runs in 2026; exact date not found | Superseded; degraded after an analysis-system upgrade; some lack precipitation | [ECMWF](https://www.ecmwf.int/en/about/media-centre/aifs-blog/2026/farewell-external-ai-models) (V; licences U) |
| Climate | NOAA AIGFS/AIGEFS (fine-tuned from GraphCast) | Used via derivative | NOAA products public; code status not found | Operational at NOAA since 17 Dec 2025 | Active | Weak on cyclone intensity | [HPCwire](https://www.hpcwire.com/aiwire/2025/12/17/noaa-deploys-new-generation-of-ai-driven-global-weather-models/) (V) |
| Climate | AIFS (ECMWF) | Open, used | Code, weights, data; data CC BY 4.0 (weights licence U) | Operational at ECMWF since 25 Feb 2025 | Active | n/a | [ECMWF](https://www.ecmwf.int/node/29308) (V) |
| Climate | WeatherNext Cyclones / WeatherNext 2 | Open, used | Code Apache-2.0, other materials CC BY 4.0 (6 Aug 2026) | US National Hurricane Center, 2025 season | Active | Full model needs high-end accelerators | [RITS NYU Shanghai](https://rits.shanghai.nyu.edu/ai/google-open-sources-weathernext-cyclone-forecasts-gain-a-day/) (V, secondary source only) |
| Climate | Aurora (Microsoft) | Open, research-only | Code and checkpoints, MIT | No operational user named | Active | Needs domain validation; operational path runs through Microsoft services | [Microsoft FAQ](https://www.microsoft.com/en-us/research/project/aurora-forecasting/faq/) (V) |
| Climate | Prithvi-EO flood and burn-scar fine-tunes | Open, research-only | Weights open; Apache-2.0 U | Demonstrations only; no operational responder named | Active | No operational partner; burn-scar training data covers 2018 to 2021 | [NASA](https://science.data.nasa.gov/learn/blog/prithvi-geospatial-model-applications) (V; licence U) |
| Climate | xView2 damage models | Open, used (ad hoc) | Code, weights, data; data licence U | UN search-and-rescue teams in Turkey 2023; AFAD, World Bank, IFRC, WFP named | Not found | Imagery latency; 85 to 90% accuracy at best; responder trust | [MIT Technology Review](https://www.technologyreview.com/2023/02/20/1068824/ai-actually-helpful-disaster-response-turkey-syria-earthquake/amp/) (V; licence U) |
| Climate | Google flood-forecasting framework | Open; used by creator | Code Apache-2.0 (3 Jun 2026); weights not mentioned | Powers Google Flood Hub; Czech hydromet institute tested it | Active | Too new; small gain in ungauged basins | [Google Research](https://www.research.google/blog/the-next-chapter-in-flood-resilience-open-sourcing-googles-hydrology-framework/) (V) |
| Climate | USFS/Google deep-learning fire-spread surrogate | Closed | No repository named | Research only | Ongoing 2021 to 2026 | Accuracy limits at high spread rates | [USDA Forest Service](https://research.fs.usda.gov/firelab/projects/deeplearning) (V) |
| Food | Pantry-for-Good (freeCodeCamp) | Open, unused | Code; licence type not found | No food bank named | Archived 17 Jul 2020; 401 stars | No maintainer; no adopter documented | [GitHub](https://github.com/freeCodeCamp/pantry-for-good) (V) |
| Food | Food Rescue Robot | Open; used by originator, now stale | Code; Beerware-style licence | Boulder Food Rescue; current use not verified | Last push 27 Dec 2021 | Single-organisation tool | [ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2Fboulder-food-rescue%2Ffood-rescue-robot) (V, mirror) |
| Food | Canteen plate-waste vision model (YOLOv11 paper) | Open, unused | Code, weights, data; licence not found | None; tested on 50 images | Not found | 175 original photos; recall 0.322; no field trial | [MDPI](https://www.mdpi.com/2076-3417/15/13/7137) (V) |
| Food | PlantVillage Nuru app | Deployed, abandoned by users (openness not verified) | Free app | Cote d'Ivoire project: 45% adoption; 56% stopped using it | Not found | No smartphone (65%); use fell when project support ended | [Frontiers in Agronomy](https://frontiersin.org/articles/10.3389/fagro.2024.1433204/full) (V) |
| Food | M5 benchmark and winning methods | Open, research-only | Data and code; licence not found | No retailer adoption documented | n/a | Only 3.4% accuracy gain at the store-item level | [arXiv 2102.13209](https://arxiv.org/pdf/2102.13209) (V) |
| Food | APHLIS loss estimates | Open, used (data) | Data open; licence not found | Feeds FAO's Food Loss Index | Not found (source is 2019) | Only 5 of 54 African Union countries reported adequate loss data in 2018 | [APHLIS](https://aphlis.net/en/news/30) (V, self-reported) |
| Food | Afresh; Shelf Engine | Closed, deployed | Closed | Afresh claims 200M lb/yr of loss prevented; Shelf Engine in 7,000+ stores | Active; Shelf Engine acquired by Crisp | Store managers override recommendations | [The Packer](https://www.thepacker.com/news/sustainability/ai-cuts-food-waste-produce-aisle-grocers-battle-cultural-overrides), [GeekWire](https://www.geekwire.com/2025/seattle-startup-shelf-engine-acquired-by-retail-data-company-crisp/) (V, vendor claims) |
| Shelter | Ramp building-footprint code | Open, unused | Code, Apache-2.0 | Not found (reuse by fAIr is U) | Last commit 2022-09-15 | No maintainer (inferred) | [repo](https://github.com/devglobalpartners/ramp-code) (V) |
| Shelter | dssg/acdhs_housing_public (CMU, Allegheny) | Open code, closed data | Code, MIT | Shadow mode Sep 2022 to Aug 2023; trial planned | 12 commits; date not readable | Data "not publicly available"; first-time homelessness recall about 4% | [arXiv 2403.12599](https://arxiv.org/pdf/2403.12599) (V) |
| Shelter | Kube, Das, Fowler allocation model | Open, research-only | Counterfactual predictions; no licence stated | None; proof of concept | Not checked | About 21% of households assigned a worse predicted outcome | [NSF PAR](https://par.nsf.gov/servlets/purl/10415667) (V) |
| Shelter | LA County prevention model; Allegheny Housing Assessment | Closed, deployed | No code found | LA: 1,498 served; Allegheny: in intake since Aug 2020 | Active | Restricted linked county data | [CPL](https://capolicylab.org/news/new-report-early-signs-of-success-from-la-countys-homelessness-prevention-pilot/), [ar5iv](https://ar5iv.labs.arxiv.org/html/2407.21209) (V; release not found) |
| Shelter | JustFix Who Owns What | Open, used | Code, GPL-3.0 | NYC tenants and organisers; user numbers not found | Last commit 2026-09-24 | n/a | [repo](https://github.com/JustFixNYC/who-owns-what) (V repo; S usage) |
| Shelter | HOT fAIr | Open, used (with limits) | Code, AGPL-3.0 | Humanitarian mappers; user test of 26 | Last commit 2026-11-15 | 78.22% accuracy vs 86.08% in the manual tool, at half the speed | [SotM 2025](https://pretalx.com/sotm2025-osm-science/talk/WJDTBX) (V) |
| Wage | Gigbox | Open, unused | Code, MIT with Commons Clause | None found | README: "currently unmaintained" | Academic prototype; no maintainer | [ecosyste.ms](https://awesome.ecosyste.ms/projects/github.com%2Fdcalacci%2Fgigbox) (V, index) |
| Wage | Driver's Seat | Deployed, abandoned | Not found | Was used by drivers | Sunsetted | Reason and date not found | [WAO](https://wao.cs.princeton.edu/) (V) |
| Wage | Benefits Data Trust tools | Deployed, abandoned (openness not found) | Not found | Served 120,000+ people in 2023 | Organisation closed 24 Aug 2024 | Organisational collapse; fate of tools unknown | [Inquirer](https://www.inquirer.com/health/benefits-data-trust-bdt-failed-acquirer-closing-august-24-20240730.html), [Route Fifty](https://route-fifty.com/management/2024/07/nonprofits-abrupt-closure-puts-access-public-benefits-risk/397968) (V) |
| Wage | FairFare | Open, used (licence and repo not found) | Described as open source | Colorado drivers' union; 4M rides from 1,000+ accounts | Active, Dec 2025 | Depends on a third-party data broker | [Princeton](https://engineering.princeton.edu/news/2025/12/08/new-tool-drives-gig-workers-toward-wage-transparency) (V) |
| Wage | MyFriendBen | Open, used | Code, MPL-2.0 | Nearly 100,000 screeners started 2023 to 2025 | Last commit 2026-11-13 | No accuracy audit; 6% rural reach in Colorado | [Urban Institute](https://www.urban.org/research/publication/myfriendben-benefits-screener) (V) |
| Wage | Stanford TR229 wage-theft ML | Closed | Report; no code mentioned | None; pilot only | 2018 to 2019 | Academic prototype | [Stanford](https://purl.stanford.edu/mx396wr3611) (V) |
| Wage | MIT Living Wage Calculator | Closed data | Viewable; no scraping or export | Widely cited (not measured) | Active | Licence needed beyond 10 locations | [LWC FAQ](https://livingwage.mit.edu/pages/faqs) (V) |
| Language | Persephone | Open, unused | Code, Apache-2.0 | No current use found | README "not actively maintained"; last commit 2020-11-04 | No maintainer; overtaken by pretrained models | [repo](https://github.com/persephone-tools/persephone), [index](https://awesome.ecosyste.ms/projects/github.com%2Fpersephone-tools%2Fpersephone) (V) |
| Language | Elpis | Open; use not found | Code, Apache-2.0 | Not found | Last commit 2024-06-03 | Needs local GPU; no modern fine-tuning | [arXiv 2608.11629](https://arxiv.org/pdf/2608.11629) (V) |
| Language | Meta MMS; NLLB-200 | Open, licence-restricted | Weights, CC-BY-NC 4.0 | Research fine-tuning only | Host repo last commit 2025-09-30 | Non-commercial; NLLB "not released for production deployment" | [MMS card](https://huggingface.co/facebook/mms-300m/blob/main/README.md), [NLLB card](https://huggingface.co/facebook/nllb-200-distilled-600M/blob/main/README.md) (V) |
| Language | Mozilla Common Voice | Open, used | Data CC0; platform MPL-2.0 | 289 languages, 38,932 hours | Last commit 2026-11-16 | Some communities want non-CC0 terms | [Mozilla](https://discourse.mozilla.org/t/release-live-mcv-scripted-speech-24-0-and-spontaneous-speech-2-0/146740) (V) |
| Language | FirstVoices | Open, used | Described as open source; licence not found | B.C. First Nations communities | Active | n/a; communities control access | [FPCC](https://fpcc.ca/firstvoices/) (V) |
| Language | Te Hiku Media Māori speech recognition | Not open by choice | Kaitiakitanga licence; no commercial use | Te Hiku's own use | Active as of 2023 | None: a sovereignty decision, not a failure | [Taiuru](https://www.taiuru.maori.nz/maori-data-sovereignty-licences/) (V) |

**Climate.** The weather story is supersession, not neglect. The first-generation open checkpoints are no longer run, but their descendants are operational inside well-resourced centres. Record "artifact unused" separately from "lineage unused". No fetched source documents a low-income-country national weather service running any of these models. The one African example is a regional-centre experiment that names GPU cost and data access as limits ([EGU26-20505](https://meetingorganizer.copernicus.org/EGU26/EGU26-20505.html)). FuXi, FengWu, NeuralGCM, ClimaX and Prithvi WxC were not researched; anything said about them is UNVERIFIED.

**Food.** Open data is used where an institution must report. Open software is abandoned where it needs hosting and support that small non-profits cannot supply. ReFED says many hunger-relief organisations are "still quite low-tech" and that tools built for one organisation may not fit another ([ReFED](https://refed.org/articles/tech-enabled-food-rescue/)). No published count of food banks using open versus commercial software was found.

**Shelter.** For predictive models, open and deployed are close to mutually exclusive. The running models are closed because their inputs are linked county records. The open one cannot run without data its own README says is unavailable. The open tools in real use are data products and lookup tools, not predictors.

**Living wage.** FairFare has a union that needs its output; MyFriendBen has a funded non-profit and 211 partners. Gigbox and Driver's Seat had no durable operator. Wage-theft ML is still at pilot stage: Harvard's enforcement lab describes models in development with three labour agencies and nothing released ([Harvard Impact Labs](https://impactlabs.harvard.edu/strategic-enforcement-lab)).

**Languages.** This area has the only direct measurement of non-use. Of 30 documentary linguists surveyed, 29 knew of NLP systems that could help, **11 had used one**, and 4 of those 11 reported a net productivity loss. Of 8 systems that were deployed, 7 were operated personally by the researcher, and all 7 said deployment could not have happened without them ([Gessler et al., ACL 2025](https://preview.aclanthology.org/evt-to-venues/2025.findings-acl.48.pdf)). Among the 19 non-users, 13 were unsure how to set the tools up. The sample is small and self-selected. Evidence conflicts here: one paper says fieldwork speech-recognition use "remains limited" ([Liang and Levow](https://aclanthology.org/2025.fieldmatters-1.3)), another asserts it is "increasingly common" without data ([Le Ferrand et al.](https://aclanthology.org/2025.acl-short.49)).

## What is measured: most open artifacts show no uptake

These numbers describe all repositories on a platform, mostly personal fine-tunes and checkpoints. They are a base rate, not a rate for public-interest tools. The zero-download share (2023) and the under-200-downloads share (2025) are different metrics and do not form a trend.

| Claim | Number | Sample and year | Source | Status |
|---|---|---|---|---|
| Hugging Face models with zero downloads | 71% | 348,181 models, Oct 2023 | [Osborne et al.](https://arxiv.org/html/2405.13058v1) | V |
| Hugging Face datasets with zero downloads | 70% | 65,761 datasets, Oct 2023 | [Osborne et al.](https://arxiv.org/html/2405.13058v1) | V |
| Download concentration | Under 1% of models take 80% of downloads | Same | [Osborne et al.](https://arxiv.org/html/2405.13058v1) | V |
| Repositories with no licence | 65% of models, 72% of datasets | 339,502 repositories, Oct 2023 | [Osborne et al.](https://arxiv.org/html/2405.13058v1) | V |
| Models with fewer than 5 commits | 71% | 380,000+ models, Nov 2023 | [Castaño et al.](https://arxiv.org/pdf/2311.13380) | V |
| Models under 200 lifetime downloads | "Roughly half" | 2M+ models, Mar 2026 | [Hugging Face](https://huggingface.co/blog/huggingface/state-of-os-hf-spring-2026) | V |
| Top 200 models' share of downloads | 49.6% | 2.2B downloads, 2020 to 2025 | [Longpre et al.](https://arxiv.org/html/2512.03073v1) | V |
| Re-uploaders' share of recent downloads | Over 22% | Same | [Longpre et al.](https://arxiv.org/html/2512.03073v1) | V |
| Scientific repositories inactive (6 months, no commit) | About 64% (11,631 of 18,244) | Data to 2023 | [SciCat](https://arxiv.org/pdf/2504.18971) | Derived from verified counts |
| Mean survival of publication-specific research code | 3.94 years (6.44 overall) | Same, 15-year window | [SciCat](https://arxiv.org/pdf/2504.18971) | V |
| Top-5,000 GitHub repositories with no commit in a year | 13% (628); 104 confirmed failed | Sep 2016 | [Coelho and Valente](https://arxiv.org/pdf/1707.02327) | V |
| Five-year survival of package repositories | Less than 50% | 1,127 repositories created 2016 | [Ait et al.](https://conf.researchr.org/details/msr-2022/msr-2022-technical-papers/16/An-Empirical-Study-on-the-Survival-Rate-of-GitHub-Projects) | V, abstract page |
| Omics tools not installable at all | 28%; 28% of URLs dead | 98 tools; 36,702 URLs | [Mangul et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC6605654) | V |
| AI conference papers with source code | 20.5%; 8.1% of those repositories gone | 10 venues, 2010 to 2019 | [arXiv 2209.14155](https://arxiv.org/abs/2209.14155v1) | V, abstract |
| NeurIPS papers with code | 27.6% (2016) to 65.5% (2021) | Data Aug 2022 | [arXiv 2308.10008](https://arxiv.org/pdf/2308.10008) | V |
| COVID-19 imaging models fit for clinical use | 0 of 62 | Papers Jan to Oct 2020 | [Cambridge](https://www.cam.ac.uk/research/news/machine-learning-models-for-diagnosing-covid-19-are-not-yet-suitable-for-clinical-use) | V, press release |
| FDA-cleared AI devices with over 10,000 reimbursed claims | 2 of 500+ | Claims 2018 to mid-2023 | [HMPI](https://hmpi.org/2024/11/17/why-ai-is-good-for-our-health-but-may-hurt-our-wallets/) | V, secondary; original not read |
| AI systems fully meeting the Digital Public Goods Standard | None as of 2025 | 241 goods in registry, early 2026 | [UNU](https://unu.edu/sites/default/files/2026-06/AI_Systems_as_Digital_Public_Goods.pdf) | V |
| AI projects reaching production (Gartner) | 48% | 644 respondents, Q4 2023 | [Gartner](https://www.gartner.com/en/newsroom/press-releases/2024-05-07-gartner-survey-finds-generative-ai-is-now-the-most-frequently-deployed-ai-solution-in-organizations) | UNVERIFIED; fetch failed, numbers from memory |
| "87% of data science projects never reach production" | 87% | No survey identified | Not found | UNVERIFIED; do not use |

Downloads are a noisy proxy. Hugging Face counts every GET and HEAD request to a model's config file and describes no deduplication or bot filtering ([HF docs](https://huggingface.co/docs/hub/models-download-stats)). A small non-zero count is weak evidence of use.

One widely repeated figure is a misreading. McKinsey's 2024 report says 72% of about 60 surveyed experts believe most efforts focus on research, not scaling ([McKinsey](https://www.mckinsey.com/no/our-insights/ai-for-social-good)). A 2025 paper restates this as "72% of AI4SI projects never make it out of the research and development phase" ([Majumdar et al.](https://arxiv.org/html/2506.14829v1)). The project-level claim has no support in the primary source. No survival audit of data-science-for-social-good fellowship projects or civic-tech brigade projects was found.

## No existing tracker records deployment

| Tracker | What it records | Records deployment? | Licence | Access | Source |
|---|---|---|---|---|---|
| Epoch AI, Data on AI Models | 33 fields: bibliographic, compute, hardware, accessibility | No; "significant use" is only an inclusion criterion | CC BY | CSV, updated daily | [Epoch](https://epoch.ai/data/ai-models-documentation/records) |
| Hugging Face Hub API | Downloads, likes, dates, tags, licence (field list UNVERIFIED) | No; downloads and Spaces only | Platform terms (UNVERIFIED) | REST with OpenAPI spec | [HF README](https://hf-data-for-research-readme.static.hf.space/README.md) |
| cfahlgren1/hub-stats | Daily snapshots of all Hub repositories | No | Not stated | Parquet | [HF README](https://hf-data-for-research-readme.static.hf.space/README.md) |
| PeaTMOSS | 281,638 model packages; 44,337 links to GitHub repositories using them | Partly: public code reuse only | Not stated | SQLite via Globus | [arXiv 2310.03620](https://arxiv.org/pdf/2310.03620) |
| Papers with Code | Paper-to-code links | No | Licence UNVERIFIED | Defunct since Jul 2025; archived JSON dumps | [CodeSOTA](https://www.codesota.com/papers-with-code/shutdown) (secondary) |
| OpenSSF Criticality Score | 10 activity and dependency signals | No | Apache-2.0 | CSV/JSON in repository | [ossf](https://github.com/ossf/criticality_score) |
| OECD.AI Catalogue of Tools and Metrics | Tools by principle, purpose, lifecycle; removes tools stale for 2 years | Partly: optional self-reported use cases | Not stated | Web only | [OECD.AI](https://oecd.ai/en/tools-faq) |
| Digital Public Goods Registry | Solutions verified against a 9-indicator standard | Not required by the standard page read | Not checked | Web; API UNVERIFIED | [DPG Standard](https://www.digitalpublicgoods.net/standard) |
| SciCat | 18,247 scientific repositories labelled active or inactive | No | Not checked | Research artifact | [arXiv 2504.18971](https://arxiv.org/pdf/2504.18971) |
| MLTRL readiness levels | 10-level scale ending in Level 9, Deployment | Scale only, no data | Open-access article | n/a | [Lavin et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC9585100) |
| GitHub API; ecosyste.ms; OpenSSF Scorecard; Software Heritage; repostatus.org | Repository state, dependents, maintenance checks, archives, status terms | No | All UNVERIFIED | All UNVERIFIED | Not fetched |

Epoch's CC BY data and the Criticality Score's Apache-2.0 data can be incorporated with attribution. PeaTMOSS and the OECD catalogue state no licence in the fetched sources, so link to them and do not redistribute.

## A row schema that separates "no evidence of use" from "unused"

Everything in this section is a proposal built on the cited anchors, not a sourced fact. No source validates public proxies such as downloads or dependents against ground-truth deployment, so the tiers are untested.

Store two independent axes. **Openness** takes one of: open, open with restricted licence, gated, closed, not open by choice. **Use status** takes one of the tiers below, computed from raw signals at a stated snapshot date.

| Use status | Rule | Anchor |
|---|---|---|
| Documented deployment | At least one deployment record with a public source dated in the last 24 months | OECD removes tools after 2 years without update ([OECD.AI](https://oecd.ai/en/tools-faq)) |
| Deployment ended | A deployment record with an end date, or an operator notice of withdrawn support | Proposal added in this report so "deployed then abandoned" is derivable |
| Signals of use, no documented deployment | Any non-fork dependent; or 200+ lifetime downloads with non-zero recent downloads; or outside commits in 12 months | 200-download cut-off from [Longpre et al.](https://arxiv.org/html/2512.03073v1) |
| Maintained, no public evidence of use | Commit in last 12 months, none of the above | 12-month threshold from [Coelho and Valente](https://arxiv.org/pdf/1707.02327) |
| Dormant, no public evidence of use | Archived, or no commit for 12+ months (flag 24+ separately), no use signals | 6-month and 24-month checks in [SciCat](https://arxiv.org/pdf/2504.18971) |
| Unavailable | Repository, weights or URL no longer resolve | 28% dead URLs in [Mangul et al.](https://pmc.ncbi.nlm.nih.gov/articles/PMC6605654) |
| Complete by declaration | Maintainers state the project is finished | Only 104 of 618 inactive-looking projects were confirmed failures ([Coelho and Valente](https://arxiv.org/pdf/1707.02327)) |

The four requested cases then fall out as queries. "Open, unused" is open plus dormant. "Deployed, abandoned" is any openness plus deployment ended. "Closed" is closed or gated. "Open, used" is open plus documented deployment.

| Group | Field | Source | Caveat |
|---|---|---|---|
| Identity | Name, canonical URLs, paper DOI or arXiv ID, repository ID, artifact type, problem area | Manual | One tool often has several homes |
| Lineage | Derivative-of and mirror-of links | Manual | Without this, a used original looks unused (GraphCast and AIGFS) |
| Provenance | Organisation, organisation type, country, funder, release date, project end date | Paper, funder page | Funder often missing |
| Openness | Openness value, licence (SPDX), weights open, data disclosed, gated | Repository metadata | 65% of Hub models had no licence in 2023 |
| Maintenance | Archived flag, last commit date, last release date, maintainer statement | Repository | Inactive can mean finished |
| Popularity | Stars, likes, citations | Platforms | Attention, not use |
| Use proxies | Downloads (30-day and lifetime), dependents | Hub API, package indexes | HEAD and CI requests count; mirrors hide use |
| Deployment evidence | One record per deployment: operator, setting, scale, start date, end date, evidence URL, evidence type, last verified | Community contribution | Positive evidence only |
| Non-use evidence | Stated barrier, barrier category, source URL | README, paper, operator page | README keyword matching alone was 37% precise ([Coelho and Valente](https://arxiv.org/pdf/1707.02327)) |
| Bookkeeping | Snapshot date per signal, verification label (V/S/U/not found/not researched), contributor | System | Store raw values, not only the status |

Barrier categories supported by the notes: illegal or restricted training data; access gating; licence restriction; infrastructure lock-in; funding or project ended; operator closed; no maintainer; superseded; failed verification or installation; author readiness disclaimer; fairness or legitimacy concern; workflow integration; community sovereignty choice.

| Destination | What to add |
|---|---|
| AI progress open dataset | Openness, lineage, maintenance, use-proxy and use-status columns on each model row. Epoch's 33 fields contain none of these. |
| AI-fixable problems database: new tools table | The tool rows above, keyed by problem. None of the five existing tabs holds per-tool status, so this needs its own table or tab. |
| Open datasets tab | The downloadable datasets in the next section, with licence and verification label. |
| Problems tab | Per-problem counts of tools by case, with the snapshot date. |
| Missing data tab | Each "not found": deployment rates for academic tools, fellowship-project survival, proxy validation, post-2023 zero-download share. |
| Who's working on it tab | Operators from deployment records, such as ROOST, ECMWF, NOAA, Eviction Lab, MyFriendBen. |
| Risks tab | Documented harms and objections: false positives, client-side scanning, allocation models that leave some households worse off, community objections to data extraction. |

## Open datasets to download and study

Check each licence page before redistributing. "Not found" in the licence column means the fetched source stated none.

| Problem | Dataset | What it is | Licence | Where | Label |
|---|---|---|---|---|---|
| Child safety | PAN12 Sexual Predator Identification corpus | Chat-text corpus for grooming-detection research, 91.2 MB | None stated | [Zenodo](https://zenodo.org/record/3713280) | V |
| Child safety | PANC build scripts (Vogt et al.) | Code to rebuild a derived corpus from PAN12 | None stated | [project site](https://early-sexual-predator-detection.gitlab.io) | V |
| Child safety | PDQ, TMK+PDQF, vPDQ reference code | Perceptual-hash implementations, runnable on any benign media | BSD | [README](https://cdn.jsdelivr.net/gh/facebook/ThreatExchange@main/README.md) | V |
| Child safety | Re-LAION-5B metadata | Cleaned image-link dataset, gated by affiliation form | Apache-2.0 | [LAION](https://laion.ai/blog/relaion-5b/) | V |
| Climate | ECMWF open data | Real-time global forecasts and initial conditions | CC BY 4.0 | [ECMWF](https://ecmwf.int/en/forecasts/datasets/open-data) | V, via [arXiv 2605.21673](https://arxiv.org/pdf/2605.21673) |
| Climate | FourCastNet3 | AI ensemble weather model weights | Apache-2.0 | [Hugging Face](https://huggingface.co/nvidia/fourcastnet3/blob/main/README.md) | V |
| Climate | Aurora | Foundation-model code and checkpoints | MIT | [Microsoft FAQ](https://www.microsoft.com/en-us/research/project/aurora-forecasting/faq/) | V |
| Climate | Google flood-forecasting framework | Hydrology model code | Apache-2.0 | [Google Research](https://www.research.google/blog/the-next-chapter-in-flood-resilience-open-sourcing-googles-hydrology-framework/) | V |
| Climate | xBD (xView2) | Satellite imagery with building-damage labels | CC BY-NC-SA 4.0 (UNVERIFIED) | xview2.org | U |
| Food | M5 (Walmart) | 30,490 store-item daily sales series | Not found (competition terms) | Kaggle | V existence |
| Food | APHLIS | Postharvest loss estimates, sub-Saharan Africa | Not found | [APHLIS](https://aphlis.net/en/news/30) | V existence |
| Food | ReFED Insights Engine | US surplus-food estimates by sector and cause | Not found | [ReFED docs](https://docs.refed.org/methodologies/food_waste_monitor/overview.html) | V existence |
| Food | Canteen plate-waste dataset | 175 plate photos with masks | Not found | [MDPI](https://www.mdpi.com/2076-3417/15/13/7137) | V existence |
| Shelter | Eviction Tracking System v4.0 | Eviction filings by tract or ZIP, 43 cities | None stated; citation requested | [Eviction Lab](https://evictionlab.org/eviction-tracking/get-the-data/) | V |
| Shelter | Kube, Das, Fowler counterfactual predictions | Predicted outcomes for 13,940 households | None stated | [NSF PAR](https://par.nsf.gov/servlets/purl/10415667) | V |
| Shelter | Ramp training data | Building-footprint labels and imagery | Not read | [Source Cooperative](https://source.coop/ramp) | S |
| Wage | SkillSpan | Annotated skill spans in job postings | MIT | [repo](https://github.com/kris927b/SkillSpan) | V |
| Wage | US Department of Labor enforcement data; O*NET | Wage-violation records; occupation taxonomy | Public domain; CC BY 4.0 (both UNVERIFIED) | Not fetched | U |
| Language | Mozilla Common Voice 24.0 | 289 languages, 38,932 hours of speech | CC0 for standard sets; per-dataset exceptions | [Mozilla](https://discourse.mozilla.org/t/release-live-mcv-scripted-speech-24-0-and-spontaneous-speech-2-0/146740) | V |
| Language | Glottolog | Catalogue of languages and families | CC BY 4.0 | [repo](https://github.com/glottolog/glottolog) | V |
| Language | MMS and NLLB-200 weights | Multilingual speech and translation models | CC-BY-NC 4.0: study yes, product no | [MMS card](https://huggingface.co/facebook/mms-300m/blob/main/README.md) | V |
| Language | AmericasNLP 2021 | Parallel text, Indigenous languages of the Americas | No licence file | [repo](https://github.com/AmericasNLP/americasnlp2021) | V |

Two cautions. The PAN12 corpus is openly downloadable but has no licence, and its contents derive from real people and from chats collected without consent, so an ethics check is prudent even for solo study. No legitimate open dataset of abusive imagery exists, and none should be sought. The MIT Living Wage Calculator prohibits scraping and export ([LWC FAQ](https://livingwage.mit.edu/pages/faqs)).

## Conclusion

The question that started this, why a published classifier is not in use, has a different answer than "nobody picked it up". The classifier was never available to pick up. That reframes what the datasets should count. "Open and unused" is the smallest and least interesting of the four cases. The larger losses are closed tools that end with their grant or operator and leave nothing recoverable, as 4NSEEK and Benefits Data Trust show. A dataset that records only open repositories will miss them.

Three original measurements are within reach and absent from the literature read here. Recompute the zero-download share from the daily Hub snapshot, since the last verified figure is from 2023. Run a survival analysis on fellowship-project repositories, the audit this research could not find. Count how many community-language speech fine-tunes on the Hub have any downloads. Each would turn a "not found" into a row.
