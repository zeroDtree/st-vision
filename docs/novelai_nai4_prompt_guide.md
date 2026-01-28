# NovelAI nai4 / nai4.5 Prompt Syntax Guide

- [NovelAI nai4 / nai4.5 Prompt Syntax Guide](#novelai-nai4--nai45-prompt-syntax-guide)
  - [1. Format Parsing](#1-format-parsing)
  - [2. Basic Concepts](#2-basic-concepts)
    - [2.1. Tags](#21-tags)
    - [2.2. Weight Syntax](#22-weight-syntax)
      - [2.2.1. Numerical Weight Syntax (Recommended)](#221-numerical-weight-syntax-recommended)
      - [2.2.2. Examples:](#222-examples)
      - [2.2.3. 📊 Weight Range Guide:](#223--weight-range-guide)
    - [2.3. Negative Weights (Very Important)](#23-negative-weights-very-important)
      - [2.3.1. Common Negative Weight Uses:](#231-common-negative-weight-uses)
      - [2.3.2. Negative Weight Guidelines:](#232-negative-weight-guidelines)
  - [3. Multi-Character System (nai4 Exclusive)](#3-multi-character-system-nai4-exclusive)
    - [3.1. Most Important New Syntax](#31-most-important-new-syntax)
  - [4. Character Position System](#4-character-position-system)
    - [4.1. Position Grid (5×5 = 25 positions)](#41-position-grid-55--25-positions)
      - [4.1.1. Position Naming Convention](#411-position-naming-convention)
      - [4.1.2. Complete 5×5 Grid (25 positions):](#412-complete-55-grid-25-positions)
      - [4.1.3. Common Shortcuts:](#413-common-shortcuts)
      - [4.1.4. Usage Examples:](#414-usage-examples)
  - [5. Negative Tags (ntags)](#5-negative-tags-ntags)
    - [5.1. Global Negative Tags:](#51-global-negative-tags)
    - [5.2. Per-Character Negative Tags:](#52-per-character-negative-tags)
  - [6. Action Tags (Character Interaction)](#6-action-tags-character-interaction)
    - [6.1. Three Prefixes:](#61-three-prefixes)
    - [6.2. Examples:](#62-examples)
  - [7. Text Rendering (nai4 V4 Model)](#7-text-rendering-nai4-v4-model)
    - [7.1. Generate Clear English Text:](#71-generate-clear-english-text)
    - [7.2. Multi-line Text:](#72-multi-line-text)
    - [7.3. Reduce Text Appearance:](#73-reduce-text-appearance)
    - [7.4. Dialogue Example Structure:](#74-dialogue-example-structure)
  - [8. Complete Multi-Character Example (nai4.5)](#8-complete-multi-character-example-nai45)


## 1. Format Parsing

```
global tags,
{char character_tags, position_tag, ntags = character_negative_tags char}
{char character_tags, position_tag, ntags = character_negative_tags char}
...
{char character_tags, position_tag, ntags = character_negative_tags char}

{ntags = global_negative_tags}
```

---

## 2. Basic Concepts

### 2.1. Tags
* All prompts are called **tags**
* Separated by English commas:

```
1girl, starry sky, night, moon
```

---

### 2.2. Weight Syntax

#### 2.2.1. Numerical Weight Syntax (Recommended)

```
weight::content::
```

#### 2.2.2. Examples:

```
1.5::rain, night::
0.5::coat::
```

**Meaning:**
* weight > 1: enhance/strengthen
* weight < 1: weaken/reduce
* weight = 1: neutral (default)

#### 2.2.3. 📊 Weight Range Guide:

| Weight        | Effect      | Use Case                           |
| ------------- | ----------- | ---------------------------------- |
| `0.1` - `0.5` | Very weak   | Subtle hints, barely visible       |
| `0.6` - `0.9` | Weak        | Background elements, minor details |
| `1.0`         | Neutral     | Default strength                   |
| `1.1` - `1.5` | Strong      | Important features, main elements  |
| `1.6` - `2.0` | Very strong | Dominant features, key focus       |
| `2.0+`        | Extreme     | Use with caution, may distort      |


### 2.3. Negative Weights (Very Important)

Used to **remove or reverse emphasis**:

```
-1::hat::
-3::hat::
```

#### 2.3.1. Common Negative Weight Uses:

```
// Color & style manipulation
-1::monochrome::                # Add color to image
-2.5::flat color::              # Increase detail/shading
-1.5::simple background::       # Avoid plain backgrounds
-2::sketch::                    # Remove sketchy look

// Unwanted elements
-1::glasses::                   # Remove glasses
-2::weapon::                    # Strongly avoid weapons
-1.5::text::                    # Reduce text appearance

// Lighting adjustments
-1::harsh shadows::             # Soften shadows
-0.8::overexposed::             # Reduce brightness
```

#### 2.3.2. Negative Weight Guidelines:

| Weight           | Effect         | Use Case                           |
| ---------------- | -------------- | ---------------------------------- |
| `-0.5` to `-1.0` | Mild removal   | Subtle adjustments                 |
| `-1.1` to `-2.0` | Strong removal | Remove unwanted features           |
| `-2.1` to `-3.0` | Very strong    | Forcefully exclude elements        |
| `-3.0+`          | Extreme        | Use sparingly, may cause artifacts |

---

## 3. Multi-Character System (nai4 Exclusive)

### 3.1. Most Important New Syntax

```
{char [tags] char}
```

**Both "char" placeholders are required, cannot be removed**

Supports:
* **Up to 6 characters**
* Each character can have independent tags

Character Structure Complete Format:

```
{char
  [character_tags],
  {pos_xx},
  ntags = [negative_tags]
char}
```

---

## 4. Character Position System

### 4.1. Position Grid (5×5 = 25 positions)

#### 4.1.1. Position Naming Convention

**Format**: `{pos_[row][col]}`

**Row (vertical)**:
- `tt` = top-top (far top)
- `t` = top
- `c` = center (middle)
- `b` = bottom
- `bb` = bottom-bottom (far bottom)

**Column (horizontal)**:
- `ll` = left-left (far left)
- `l` = left
- `c` = center (middle)
- `r` = right
- `rr` = right-right (far right)

#### 4.1.2. Complete 5×5 Grid (25 positions):

| row\col      | ll (far-left) | l (left) | c (center) | r (right) | rr (far-right) |
| ------------ | ------------- | -------- | ---------- | --------- | -------------- |
| tt (far-top) | `ttll`        | `ttl`    | `ttc`      | `ttr`     | `ttrr`         |
| t (top)      | `tll`         | `tl`     | `tc`       | `tr`      | `trr`          |
| c (center)   | `cll`         | `cl`     | `cc`       | `cr`      | `crr`          |
| b (bottom)   | `bll`         | `bl`     | `bc`       | `br`      | `brr`          |
| bb (far-bot) | `bbll`        | `bbl`    | `bbc`      | `bbr`     | `bbrr`         |

#### 4.1.3. Common Shortcuts:

For convenience, some positions have shorter aliases:
- `c` = `cc` (center-center)
- `t` = `tc` (top-center)
- `b` = `bc` (bottom-center)
- `l` = `cl` (center-left)
- `r` = `cr` (center-right)

#### 4.1.4. Usage Examples:

```
{pos_ttll}  # Far top-left corner
{pos_ttc}   # Far top center
{pos_ttrr}  # Far top-right corner

{pos_tl}    # Top-left
{pos_tc}    # Top-center (or just {pos_t})
{pos_tr}    # Top-right

{pos_cl}    # Center-left (or just {pos_l})
{pos_cc}    # Center-center (or just {pos_c})
{pos_cr}    # Center-right (or just {pos_r})

{pos_bl}    # Bottom-left
{pos_bc}    # Bottom-center (or just {pos_b})
{pos_br}    # Bottom-right

{pos_bbll}  # Far bottom-left corner
{pos_bbc}   # Far bottom center
{pos_bbrr}  # Far bottom-right corner
```


## 5. Negative Tags (ntags)

### 5.1. Global Negative Tags:

```
ntags = blurry, lowres, jpeg artifacts, worst quality
```

### 5.2. Per-Character Negative Tags:

```
{char klee,
 white pantyhose,
 ntags = hat, bag
char}
```

---

## 6. Action Tags (Character Interaction)

Prevents action confusion and information leakage.

### 6.1. Three Prefixes:

```
source#action      # Initiator
target#action      # Receiver
mutual#action      # Mutual action
```

### 6.2. Examples:

```
source#hug
target#hug
mutual#holding hands
```

---

## 7. Text Rendering (nai4 V4 Model)

### 7.1. Generate Clear English Text:

```
Text: HAVE FUN!
```

### 7.2. Multi-line Text:

```
Text: How are you?

Fine, thanks
```

### 7.3. Reduce Text Appearance:

```
no text
```

### 7.4. Dialogue Example Structure:

```
girls, text, english text, speech bubble,
looking at another,
rating:general
```
---

## 8. Complete Multi-Character Example (nai4.5)

```
2girls, 1.5::adult women::, masterpiece, best quality, amazing quality, very aesthetic, absurdres,
1.3::soft lighting::, 1.2::warm-toned::, 1.4::alluring::, cinematic light, depth of field,

{char
  1girl,
  1.5::long wavy black hair::, amber eyes, 1.3::sultry expression::, 1.4::slender body::,
  1.5::casual hiking outfit::, hiking boots, backpack, standing, climbing a mountain, looking at viewer,
  {pos_cl},
  ntags = bad anatomy, bad hands, extra fingers, extra arms, missing fingers,
          deformed face, cross-eye, lowres, blurry
char},

{char
  1girl,
  1.5::long blonde hair::, green eyes, 1.4::curvy body::, 1.3::playful smile::,
  1.5::casual hiking outfit::, hiking boots, backpack, standing, climbing a mountain, looking at viewer,
  {pos_cr},
  ntags = bad anatomy, bad hands, extra fingers, extra arms, missing fingers,
          deformed face, cross-eye, lowres, blurry
char},

{ntags = worst quality, bad quality, jpeg artifacts, watermark, logo,
cropped, out of frame, duplicate, extra limbs,
-1::monochrome::, -1::simple background::}
```