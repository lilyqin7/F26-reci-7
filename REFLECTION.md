# Reflection

**Name / Andrew ID:** Lily Qin lilyq

**Recitation group members (Task 2):**

---

### 1. Valid but weak

Pick a property you wrote that passes on the correct implementation but
kills few or no mutants. Why is it still a *valid* property? Describe a
concrete bug (not one of our mutants) that it *would* catch.

The property “every result color is G, Y, or B” killed no public mutants, but it is still valid because the specification restricts every output position to those three colors. It would catch a bug where the implementation used a different marker for an unmatched letter—for example, returning 'X' instead of 'B'—even if the rest of the scoring logic were correct.

### 2. A generator problem, not a property problem

Describe a mutant, from either task, that survived or was flaky because of
your **generator** rather than your property. What did the generator fail to
produce? How did you fix it? Paste the runner output from before and after.

The singlePass Wordle mutant was flaky when my duplicate-letter property used words drawn from the full alphabet. The property was correct: it checks that a letter is never credited more often than it appears in the secret. But random five-letter words over 26 letters rarely contain the repeated-letter arrangements needed to expose this bug.

~ singlePass     flaky: killed in 3/5 runs  by: never credits a letter more times than the secret contains it
      Counterexample: ["AARAA","RARAA"]
      AssertionError: expected 2 to be less than or equal to 1

  ✔ singlePass     killed  by: never credits a letter more times than the secret contains it
      Counterexample: ["AAABA","AABBA"]
      AssertionError: expected 2 to be less than or equal to 1

### 3. Reading a counterexample

Paste one counterexample that the mutation runner printed for a killed
mutant. In 2–3 sentences, explain using the *specification* why that input
exposes the bug.

Counterexample: ["CAAAA", "AAAAA"] for the singlePass mutant.
The secret has four As, all already used by greens in positions 2–5, so the first guessed A must be black; the correct result is [B, G, G, G, G]. The specification says a yellow may only use an occurrence not already used by a green or earlier yellow, so crediting all five As is incorrect.

### 4. Your project

Name one function or module in your team's project that would benefit from
property-based testing. State two properties in English, name the pattern of
each, and describe the generator you'd need, including anything about its
inputs that a naive generator would get wrong.

The function that reveals the next hint and records progress. 
Invariant: Visible hints are always a contiguous prefix of the ordered hint list. If hint 3 is visible, hints 1 and 2 must also be visible; no later hint may appear early.
Conditional: When every hint is already revealed, requesting another hint leaves the state unchanged and returns no additional hint.

The generator should construct valid ordered hint lists plus a valid revealed-count from 0 through the list length. A naive generator might create an out-of-range count, missing hint text, or a state with hint 3 revealed but hint 2 hidden—states users cannot reach through the feature and that could make a correct implementation appear to fail.