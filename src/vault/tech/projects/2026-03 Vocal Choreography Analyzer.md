---
date: 2026-03-09
added: 2026-11-14
title: "Vocal Choreography Analyzer"
ai_title: true
tags: [music/a-cappella, visualization]
affiliation: independent
type: programming
link: /viz/2026-03-vocal-choreography-analyzer.html
published: true
---
<ai>
A tool for choreographing a cappella (Voices in Your Head, 2025-26).
</ai>

**Rhea (Claude chat, Mar 9 2026):** "what if i wanted a tool to parse a peice of sheet music and find or color code all of the analog / parallel moments or similar downbeats of a piece of music that has many vocal parts to it. Essentially, I want to see what movements and beats are intuitive for each vocal line so that chorereographing dance and movement is not too hard on any one part that has a hard rhtymic line taht would be harder to execute whiel dancing. can you help me build osmething liek that?"

**Rhea, later in the same chat:** "are we able to play the songs or rhythms as part of this so i can hear when these moments happen? i dont necessarily need choreo suggestions but i do want insights into more difficult rhtythms / where other parts are on similar difficult rhythms"

<ai>
Drop in a MusicXML file (.musicxml, .xml or .mxl; from Sibelius, MuseScore, Finale or Dorico use File → Export → MusicXML). The tool reads every vocal part and lines them up on one beat grid: moments where parts land together are easy to move on as a group, and syncopated or dense lines are flagged as harder to sing while dancing. It can play the parts back (with the real pitches from the score) so you can hear where those moments are. Built by Claude from the prompts above; it runs entirely in your browser and nothing is uploaded.
</ai>
