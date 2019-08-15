const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

describe('config', () => {
  test('it can read a list of OR conditions', () => {
    // Get document, or throw exception on error
    try {
      const doc = yaml.safeLoad(fs.readFileSync(path.join(__dirname, './fixtures/logic-config.yml'), 'utf8'));
      console.log(doc);
      expect(doc).toEqual({
        xs: {
          or: [
            { max_additions: 10, max_deletions: 10 },
            { max_deletions: 20 }
          ]
        }
      });
    } catch (e) {
      console.log(e);
    }
  });
});
