module.exports = ({ config, existingLabels, additions, deletions, logger }) => {
  const log = logger || function () { console.log(...arguments); };
  const labelsToAdd = new Set();
  const labelsToRemove = new Set();

  const netSize = additions - deletions;
  log(`Additions: ${additions}, Deletions: ${deletions}, Net Size: ${netSize}`);

  // eslint-disable-next-line guard-for-in
  for (const label in config) {
    log('looking for size matches', label, config[label]);
    let passes = false;
    let rules = 'or' in config[label] ? config[label].or : [config[label]];
    for (const rule of rules) {
      let rulePasses = true;
      if ('min_additions' in rule) {
        rulePasses = rulePasses && additions >= rule.min_additions;
      }
      if ('min_deletions' in rule) {
        rulePasses = rulePasses && deletions >= rule.min_deletions;
      }
      if ('min' in rule) {
        rulePasses = rulePasses && netSize >= rule.min;
      }
      if ('max_additions' in rule) {
        rulePasses = rulePasses && additions <= rule.max_additions;
      }
      if ('max_deletions' in rule) {
        rulePasses = rulePasses && deletions <= rule.max_deletions;
      }
      if ('max' in rule) {
        rulePasses = rulePasses && netSize <= rule.max;
      }
      passes = passes || rulePasses;
    }
    if (passes && !existingLabels.has(label)) {
      labelsToAdd.add(label);
    } else if (!passes && existingLabels.has(label)) {
      labelsToRemove.add(label);
    }
    if (passes && config[label].terminal) {
      log('Skipping remaining rules.');
      break;
    }
  }

  return {
    labelsToAdd: Array.from(labelsToAdd),
    labelsToRemove: Array.from(labelsToRemove)
  };
};
