/* ===== 公式、图表渲染 + 溢出滚动 + 表格边框强化 + 侧边目录（h2-h6，h5/h6折叠） ===== */

// ---------- MathJax ----------
window.MathJax = {
  tex: {
    inlineMath: [['$', '$'], ['\\(', '\\)']],
    displayMath: [['$$', '$$'], ['\\[', '\\]']],
    processEscape: true //支持 \$ 显示美元符号，避免冲突
  }
};

var mathjaxScript = document.createElement('script');
mathjaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
mathjaxScript.async = true;
document.head.appendChild(mathjaxScript);

// ---------- Mermaid ----------
var mermaidScript = document.createElement('script');
mermaidScript.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
mermaidScript.onload = function() {
  mermaid.initialize({ startOnLoad: true, theme: 'default' });
};
document.head.appendChild(mermaidScript);

// ---------- 包裹超宽元素 ----------
function wrapScrollableElements() {
  document.querySelectorAll('.content table').forEach(table => {
    if (!table.parentElement.classList.contains('scrollable-wrapper')) {
      const wrapper = document.createElement('div');
      wrapper.className = 'scrollable-wrapper';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    }
  });

  document.querySelectorAll('.content img').forEach(img => {
    const checkAndWrap = () => {
      if (img.naturalWidth > 0 && img.naturalWidth > img.clientWidth && !img.parentElement.classList.contains('scrollable-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'scrollable-wrapper';
        img.parentNode.insertBefore(wrapper, img);
        wrapper.appendChild(img);
      }
    };
    if (img.complete) checkAndWrap();
    else img.addEventListener('load', checkAndWrap, { once: true });
  });
}

// ---------- 表格合并行边框强化 ----------
function addTableRowClasses() {
  document.querySelectorAll('.content table').forEach(table => {
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0) return;
    rows.forEach(row => row.classList.remove('row-start', 'row-end', 'table-end'));

    rows.forEach((row, rowIdx) => {
      const spannedCells = row.querySelectorAll('td[rowspan], th[rowspan]');
      spannedCells.forEach(cell => {
        const span = parseInt(cell.getAttribute('rowspan'), 10);
        if (span > 1) {
          row.classList.add('row-start');
          const endIdx = rowIdx + span - 1;
          if (endIdx < rows.length) rows[endIdx].classList.add('row-end');
        }
      });
    });
    rows[rows.length - 1].classList.add('table-end');
  });
}

// ---------- 侧边目录生成（含 h4/h5/h6，h5/h6 默认折叠） ----------
function createTableOfContents() {
  const article = document.querySelector('.article');
  if (!article) return;

  const content = article.querySelector('.content');
  if (!content) return;

  // 获取正文内标题（h2 - h6）
  const contentHeadings = content.querySelectorAll('h2, h3, h4, h5, h6');

  // 获取摘要和参考文献的标题（假设它们都是 h2）
  const summary = article.querySelector('.summary h2');
  const references = article.querySelector('.references h2');

  // 给所有参与目录的标题添加 id（包括摘要和参考文献）
  const allHeadings = [];
  if (summary) {
    if (!summary.id) summary.id = 'summary-heading';
    allHeadings.push(summary);
  }
  contentHeadings.forEach((h, idx) => {
    if (!h.id) h.id = 'heading-' + idx;
    allHeadings.push(h);
  });
  if (references) {
    if (!references.id) references.id = 'references-heading';
    allHeadings.push(references);
  }

  if (allHeadings.length === 0) return;

  // ---------- 构建目录 DOM ----------
  const tocContainer = document.createElement('aside');
  tocContainer.className = 'article-toc-float';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'toc-title';
  titleDiv.textContent = '目录';
  tocContainer.appendChild(titleDiv);

  let buffer = [];                // 存放 h5/h6 子项
  let currentH4Anchor = null;    // 最近的一个 h4 链接元素

  function addChildGroup(h4Anchor, children) {
    const toggle = document.createElement('span');
    toggle.className = 'toc-toggle';
    toggle.innerHTML = '▶';
    toggle.onclick = function(e) {
      e.stopPropagation();
      const childDiv = h4Anchor.parentElement.querySelector('.toc-children');
      if (childDiv) {
        childDiv.classList.toggle('open');
        toggle.classList.toggle('open');
      }
    };

    const childDiv = document.createElement('div');
    childDiv.className = 'toc-children';
    children.forEach(child => {
      const ca = document.createElement('a');
      ca.href = '#' + child.id;
      ca.className = 'toc-' + child.level;
      ca.textContent = child.text;
      childDiv.appendChild(ca);
    });

    h4Anchor.insertAdjacentElement('afterend', childDiv);
    h4Anchor.insertAdjacentElement('afterend', toggle);
  }

  // 辅助函数：添加单个链接
  function appendLink(id, text, level) {
    const a = document.createElement('a');
    a.href = '#' + id;
    a.className = 'toc-' + level;
    a.textContent = text;
    tocContainer.appendChild(a);
    if (level === 'h4') {
      currentH4Anchor = a;
    } else {
      currentH4Anchor = null;
    }
  }

  // 先处理可能存在的摘要标题（特殊处理，放在最前）
  if (summary) {
    appendLink(summary.id, summary.textContent, 'summary');
  }

  // 遍历正文标题
  contentHeadings.forEach(heading => {
    const level = heading.tagName.toLowerCase();
    const id = heading.id;
    const text = heading.textContent;

    if (level === 'h5' || level === 'h6') {
      buffer.push({ level, id, text });
      return;
    }

    // 遇到 h2/h3/h4 时，先处理之前积攒的 h5/h6
    if (buffer.length > 0) {
      if (currentH4Anchor) {
        addChildGroup(currentH4Anchor, buffer);
      } else {
        buffer.forEach(child => {
          appendLink(child.id, child.text, child.level);
        });
      }
      buffer = [];
    }

    // 添加当前标题
    appendLink(id, text, level);
  });

  // 处理最后残余的 h5/h6
  if (buffer.length > 0) {
    if (currentH4Anchor) {
      addChildGroup(currentH4Anchor, buffer);
    } else {
      buffer.forEach(child => {
        appendLink(child.id, child.text, child.level);
      });
    }
  }

  // 最后添加参考文献标题
  if (references) {
    appendLink(references.id, references.textContent, 'references');
  }

  // 插入目录到文章容器前面（.container 内 .article 之前）
  const container = article.parentElement;
  container.insertBefore(tocContainer, article);

  // 高亮观察（包括所有标题）
  const allLinks = tocContainer.querySelectorAll('a');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const link = tocContainer.querySelector(`a[href="#${id}"]`);
      if (entry.isIntersecting) {
        allLinks.forEach(l => l.classList.remove('active'));
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -60% 0px' });

  allHeadings.forEach(h => observer.observe(h));
}

// ---------- 总初始化 ----------
function postProcess() {
  wrapScrollableElements();
  addTableRowClasses();
  createTableOfContents();    // 会内部再次调用包裹（为了重新处理移动后的内容）
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', postProcess);
} else {
  postProcess();
}