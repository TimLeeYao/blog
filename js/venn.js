// ===== 韦恩图渲染（修正 CDN 版本） =====
(function() {
  function loadScript(src, callback) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = function() {
      console.error('韦恩图：脚本加载失败 - ' + src);
    };
    document.head.appendChild(script);
  }

  // 先加载 D3
  loadScript('https://d3js.org/d3.v7.min.js', function() {
    // 再加载 venn.js（使用 @latest 自动获取真实版本）
    loadScript('https://cdn.jsdelivr.net/npm/venn.js@latest/venn.min.js', function() {
      // 页面完全加载后再渲染
      if (document.readyState === 'complete') {
        renderAllVenns();
      } else {
        window.addEventListener('load', renderAllVenns);
      }
    });
  });

  function renderAllVenns() {
    var containers = document.querySelectorAll('.venn');
    containers.forEach(function(container) {
      // 避免重复渲染
      if (container.querySelector('svg')) return;

      var sets;
      try {
        sets = JSON.parse(container.getAttribute('data-sets'));
      } catch (e) {
        container.innerHTML = '<p style="color:red;">韦恩图 JSON 格式错误</p>';
        return;
      }

      var width = container.clientWidth || 500;
      var height = Math.min(400, width * 0.8);

      var svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', '0 0 ' + width + ' ' + height)
        .style('max-width', '100%')
        .style('height', 'auto')
        .style('display', 'block')
        .style('margin', '0 auto');

      var chart = venn.VennDiagram()
        .width(width)
        .height(height);

      svg.datum(sets).call(chart);

      // 学术配色（深绿、金色）
      var colors = ['#2d5a27', '#b8943c', '#6b8e23'];
      svg.selectAll('.venn-circle path')
        .attr('stroke', '#2d5a27')
        .attr('stroke-width', 2)
        .attr('fill-opacity', 0.25)
        .attr('fill', function(d, i) {
          return colors[i % colors.length];
        });

      svg.selectAll('.venn-circle text')
        .attr('fill', '#1a1a1a')
        .attr('font-family', 'Georgia, Times New Roman, serif')
        .attr('font-size', '14px');

      svg.selectAll('.venn-intersection text')
        .attr('fill', '#1a1a1a')
        .attr('font-family', 'Georgia, Times New Roman, serif')
        .attr('font-size', '13px');
    });
  }
})();