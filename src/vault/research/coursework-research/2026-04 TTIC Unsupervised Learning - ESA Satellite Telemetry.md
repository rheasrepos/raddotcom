---
title: Uncovering Latent Structure in ESA Satellite Telemetry
ai_title: true
date: 2026-04-30
type: research
academic: true
course: TTIC 31220 Unsupervised Learning & Data Analysis
collaborators:
  - Hewitt Watkins
published: true
source: University of Chicago/Year 4/year4springquarter/unsupervised learning and data analysis/ (TTIC-ESA-Spacecraft-Telemetry repo + TTIC Project Proposal.docx + psets/notebooks)
tags:
  - academic
  - ai/machine-learning
form:
  - research-paper
affiliation: uchicago
genre: project
---

# Uncovering Latent Structure in ESA Satellite Telemetry

Final project for **TTIC 31220 (Unsupervised Learning & Data Analysis)**, with Hewitt Watkins, April 2026.

## The question
Spacecraft telemetry (power, thermal, attitude control, comms) is currently monitored manually or with simple threshold alerts. Prior work (ESA-ABD, Kotowski et al. 2024) showed existing unsupervised anomaly-detection methods produce consistent false alarms — but no one asked what **latent structure** actually underlies the telemetry, or whether that structure is **consistent across missions**. The project learns interpretable low-dimensional representations of ESA mission data to find out. (Pivoted from NASA position-based telemetry, which was too gravity-dependent to be interesting.)

## Methods explored (repo: `TTIC-ESA-Spacecraft-Telemetry`)
- k-means baseline
- PCA + k-means
- Kernel PCA (Nyström approximation) + k-means
- GMM parametric discovery
- VAE generative discovery

## Where it lives
`University of Chicago/Year 4/year4springquarter/unsupervised learning and data analysis/` — the git repo `TTIC-ESA-Spacecraft-Telemetry/` (notebooks + results), `TTIC Project Proposal.docx`, and the course psets/hw notebooks (`2026_ttic31220_hw1–4`).

## Connections
Methodologically adjacent to your [[2026 claude experiment - 02-weight-symmetries]] (SVD/PCA interpretability) and the CAB Lab NLP/fMRI work.

## Topics
- [[Topic - academic]]
- [[Topic - ai]]
- [[Topic - ai · machine-learning]]
