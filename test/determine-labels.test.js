const determineLabels = require('../src/determine-labels');

describe('determineLabels()', () => {
  let logLines = [];

  const defaultParams = () => {
    // reset logLines array
    logLines = [];
    return {
      config: {
        xs: {
          min_additions: 1,
        }
      },
      additions: 0,
      deletions: 0,
      existingLabels: new Set(),
      logger: (...args) => logLines.push(args),
    };
  }

  test('min', () => {
    const { labelsToAdd } = determineLabels({
      ...defaultParams(),
      config: {
        xs: {
          min: 1,
        }
      },
      additions: 10,
      deletions: 8,
    });

    expect(labelsToAdd).toEqual(['xs']);
  });

  test('max', () => {
    const { labelsToAdd } = determineLabels({
      ...defaultParams(),
      config: {
        xs: {
          max: 3,
        },
        sm: {
          max: 10,
        }
      },
      additions: 10,
      deletions: 1,
    });

    expect(labelsToAdd).toEqual(['sm']);
  });

  test('min_additions', () => {
    const { labelsToAdd } = determineLabels({
      ...defaultParams(),
      config: {
        xs: {
          min_additions: 1,
        }
      },
      additions: 10,
    });

    expect(labelsToAdd).toEqual(['xs']);
  });

  test('max_additions', () => {
    const { labelsToAdd } = determineLabels({
      ...defaultParams(),
      config: {
        xs: {
          max_additions: 5,
        },
        sm: {
          max_additions: 10,
        },
      },
      additions: 10,
    });

    expect(labelsToAdd).toEqual(['sm']);
  });

  test('min_deletions', () => {
    const { labelsToAdd } = determineLabels({
      ...defaultParams(),
      config: {
        xs: {
          min_deletions: 1,
        }
      },
      deletions: 10,
    });

    expect(labelsToAdd).toEqual(['xs']);
  });

  test('max_deletions', () => {
    const { labelsToAdd } = determineLabels({
      ...defaultParams(),
      config: {
        xs: {
          max_deletions: 5,
        },
        sm: {
          max_deletions: 10,
        },
      },
      deletions: 10,
    });

    expect(labelsToAdd).toEqual(['sm']);
  });

  test('labelsToRemove', () => {
    const { labelsToRemove } = determineLabels({
      ...defaultParams(),
      config: {
        xs: {
          max: 5,
        },
        sm: {
          max: 10,
        }
      },
      additions: 10,
      deletions: 0,
      existingLabels: new Set(['xs']),
    });
    expect(labelsToRemove).toEqual(['xs']);
  });

  test('no change', () => {
    const { labelsToAdd, labelsToRemove } = determineLabels({
      ...defaultParams(),
      config: {
        xs: {
          max: 5,
        },
        sm: {
          max: 10,
        }
      },
      additions: 10,
      deletions: 0,
      existingLabels: new Set(['sm']),
    });
    expect(labelsToAdd).toHaveLength(0);
    expect(labelsToRemove).toHaveLength(0);
  });

  test('or conditions', () => {
    const params = {
      ...defaultParams(),
      config: {
        xs: {
          or: [
            { max_additions: 10 },
            { max_deletions: 10 },
          ]
        },
        sm: {
          or: [
            { min_additions: 11, max_additions: 20 },
            { min_deletions: 11 },
          ]
        },
        md: {
          or: [
            { min_additions: 21 }
          ]
        }
      },
    };
    expect(determineLabels({
      ...params,
      additions: 5,
    }).labelsToAdd).toEqual(['xs']);

    expect(determineLabels({
      ...params,
      additions: 15,
      deletions: 10,
    }).labelsToAdd).toEqual(['xs', 'sm']);

    expect(determineLabels({
      ...params,
      additions: 5,
      deletions: 15,
    }).labelsToAdd).toEqual(['xs', 'sm']);
  });

});
