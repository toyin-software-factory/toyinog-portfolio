import { Prose } from "@/components/ui";

import { StyleguideSection } from "./StyleguideSection";

// Sample of what the Markdown pipeline (spec 0002) produces. Static, written here.
const sampleHtml = `
<p>Case studies are written in Markdown and rendered at build time. This block shows every element the <code>Prose</code> component styles, at a 42rem reading width.</p>
<h2>The problem</h2>
<p>Customers abandoned the checkout at the payment step. Interviews pointed at <strong>surprise fees</strong> and a form that asked for too much. Read more on <a href="/">the home page</a>.</p>
<h3>What I changed</h3>
<ul>
  <li>Showed the full price before the payment step.</li>
  <li>Cut the form from eleven fields to five.</li>
  <li>Added inline validation that explains how to fix each error.</li>
</ul>
<ol>
  <li>Research</li>
  <li>Prototype</li>
  <li>Ship and measure</li>
</ol>
<blockquote><p>The fastest checkout is the one that never surprises you.</p></blockquote>
<h4>Implementation note</h4>
<p>Prices come from one helper, <code>formatPrice()</code>, so every screen agrees.</p>
<pre><code>export const formatPrice = (pence: number) =&gt;
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(pence / 100);</code></pre>
<hr />
<p>Images in case studies are pre sized and sit at full reading width, with alt text from the Markdown.</p>
`;

export function ProseSection() {
  return (
    <StyleguideSection
      id="prose"
      number="07"
      title="Prose"
      intro="Headings, paragraphs, lists, links, quotes, inline code and code blocks from rendered Markdown, using tokens only."
    >
      <Prose html={sampleHtml} />
    </StyleguideSection>
  );
}
