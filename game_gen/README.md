# Wordrow Game Generation

## Anagrams

The specific game instances (set of words to guess) are precomputed during CI. This allows us to
host the game on a simple server without an actual backend. This program creates the entires set of
game instances as separate JSON files.

## Hunspell Exploder

It is not always possible to find an official list of words (as can be found in `dict/`). In this
case, this program can be used to generate it from the Hunspell dictionaries used as part of the
Libre Office.
