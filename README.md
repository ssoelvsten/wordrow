# Wordrow

Wordrow is a reimplementation of the classic internet puzzle game [Text
Twist](https://texttwist.info) as a static webpage with a modern and sleek design.

<div align="center">
  <img src="/example.2026.png"
       alt="Image of game"
       style="max-width:32rem; width:32rem;" />
</div>

The project consists of the following three folders:

- **dict**
  A (modified) copy of dictionaries for certain languages.

- **dict.cpp**:
  C++ applications to process and generate the *dict/* folder. In particular,
  this generates the json files used by the *game/* efficiently via the
  [*Anatree* data structure](http://github.com/ssoelvsten/anatree).

- **game**
  The game itself. This is implemented as a static React application.

These are precompiled into the final game which is served on *GitHub pages*.

## Comparison

### Game Modes

|             | Text Twist | Text Twist 2 | Wordrow |
|-------------|------------|--------------|---------|
| **Timed**   | ✓          | ✓            | ✓       |
| **Untimed** |            | ✓            | ✓       |
| **Blitz**   |            |              | ✓       |
| **Daily**   |            |              | ✓       |

Each game supports the following word lengths.

|       | Text Twist | Text Twist 2 | Wordrow |
|-------|------------|--------------|---------|
| **6** | ✓          | ✓            | ✓       |
| **7** |            | ✓            | (✓)     |

### Score Comparison

Guessing a word with **N** letters is scored as shown below. **Bonus** refers to
the multiplier applied for guessing all words.

|           | Text Twist | Text Twist 2 | Wordrow |
|-----------|------------|--------------|---------|
| **3**     | 90         | 1500         | 200     |
| **4**     | 160        | 2000         | 400     |
| **5**     | 250        | 2500         | 800     |
| **6**     | 360        | 3000         | 1600    |
| **7**     | --         | 3500         | 3200    |
|           |            |              |         |
| **Bonus** | ~2x        | 0            | 2x      |

So, the [*100.000 points in 10 minutes*](https://youtu.be/nbOPAoWP_Y0) challenge
for Text Twist is approximately equivalent to *400.000 points in 10 minutes*.

### Languages

The original Text Twist games only supported (American) English. Wordrow also
supports German, Spanish, and Danish.

## License

The software and documentation files in this repository are provided under the
[GPL v3](/LICENSE.md) license.
