(function () {
  var CSV_URL = 'https://erhun.me/pdf/publications.csv';

  function parseCSVLine(line) {
    var result = [], current = '', inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current); current = '';
      } else {
        current += ch;
      }
    }
    result.push(current);
    return result;
  }

  function parseCSV(text) {
    var lines = text.trim().split('\n');
    var headers = parseCSVLine(lines[0]);
    return lines.slice(1).map(function (line) {
      var values = parseCSVLine(line);
      var obj = {};
      headers.forEach(function (h, i) { obj[h] = (values[i] || '').trim(); });
      return obj;
    });
  }

  function esc(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function formatPages(pages) {
    return esc(pages).replace(/-/g, '&ndash;');
  }

  function linkedTitle(p) {
    var url = p['DOI/URL'], title = esc(p['Title']);
    if (url && url !== '') {
      return '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + title + '</a>';
    }
    return title;
  }

  function renderCitation(p) {
    var authors   = esc(p['Authors']);
    var title     = esc(p['Title']);
    var ltitle    = linkedTitle(p);
    var venue     = esc(p['Venue']);
    var volume    = p['Volume'];
    var issue     = p['Issue'];
    var pages     = p['Pages'];
    var year      = esc(p['Year']);
    var publisher = esc(p['Publisher']);
    var editors   = esc(p['Editors']);
    var template  = p['Template'];
    var pagesStr  = formatPages(pages);
    var hasPages  = pages && pages !== '';
    var hasVol    = volume && volume !== '';
    var hasIssue  = issue && issue !== '';
    var hasEd     = editors && editors !== '';
    var hasPub    = publisher && publisher !== '';
    var c = '';

    if (template === 'journal_article') {
      c = authors + ', &ldquo;' + ltitle + ',&rdquo; <em>' + venue + '</em>';
      if (hasVol)   c += ', vol. ' + esc(volume);
      if (hasIssue) c += ', no. ' + esc(issue);
      if (hasPages) c += (pages.indexOf('-') !== -1 ? ', pp. ' : ', ') + pagesStr;
      c += ', ' + year + '.';

    } else if (template === 'book_chapter' || template === 'book_chapter_fields') {
      c = authors + ', <em>' + venue + '</em>';
      if (venue.indexOf('vol.') === -1 && hasVol) c += ', vol. ' + esc(volume);
      if (hasEd)  c += ', ' + editors + ', Eds.';
      if (hasPub) c += ', ' + publisher;
      c += ', ' + year + ', ch. ' + title;
      if (hasPages) c += ', pp. ' + pagesStr;
      c += '.';

    } else if (template === 'in_book') {
      c = authors + ', &ldquo;' + title + ',&rdquo; in <em>' + venue + '</em>';
      if (hasEd)  c += ', ' + editors + ', Eds.';
      if (venue.indexOf('vol.') === -1 && hasVol) c += ', vol. ' + esc(volume);
      if (hasPub) c += ', ' + publisher;
      c += ', ' + year;
      if (hasPages) c += ', pp. ' + pagesStr;
      c += '.';

    } else if (template === 'conference_book') {
      c = authors + ', &ldquo;' + title + ',&rdquo; in <em>' + venue + '</em>';
      if (hasPub) c += ', ' + publisher;
      c += ', ' + year;
      if (hasPages) c += ', pp. ' + pagesStr;
      c += '.';

    } else if (template === 'conference') {
      c = authors + ', &ldquo;' + title + ',&rdquo; in <em>' + venue + '</em>';
      if (hasEd)  c += ', ' + editors + ', Eds.';
      if (hasVol) c += ', vol. ' + esc(volume);
      c += ', ' + year;
      if (hasPages) c += ', pp. ' + pagesStr;
      c += '.';

    } else if (template === 'edited_proceedings') {
      c = authors + ', Eds. <em>' + title + '</em>, ' + year + '.';

    } else if (template === 'edited_volume') {
      c = authors + ', Eds., <em>' + title + '</em>';
      if (venue) c += ', ' + venue;
      if (hasPub) c += ', ' + publisher;
      c += ', ' + year + '.';

    } else {
      c = authors + ', &ldquo;' + ltitle + ',&rdquo; <em>' + venue + '</em>';
      if (year) c += ', ' + year;
      c += '.';
    }

    return c;
  }

  function renderPublications(pubs) {
    var list = document.getElementById('publications-list');
    if (!list) return;

    var filtered = pubs.filter(function (p) { return p['Year'] >= '2013'; });
    filtered.sort(function (a, b) { return b['Year'].localeCompare(a['Year']); });

    var html = filtered.map(function (p) {
      var sourceCode = p['Source Code'];
      var sourceLink = sourceCode && sourceCode !== ''
        ? ' <a href="' + esc(sourceCode) + '" class="publication__source" target="_blank" rel="noopener noreferrer">Source Code</a>'
        : '';
      return '<li class="publication"><span class="citation">' + renderCitation(p) + sourceLink + '</span></li>';
    }).join('');

    list.innerHTML = html;
  }

  function load() {
    var list = document.getElementById('publications-list');
    if (!list) return;
    fetch(CSV_URL)
      .then(function (r) { return r.text(); })
      .then(function (text) { renderPublications(parseCSV(text)); })
      .catch(function () {
        var list = document.getElementById('publications-list');
        if (list) list.innerHTML = '<li class="publication">Publications could not be loaded.</li>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
