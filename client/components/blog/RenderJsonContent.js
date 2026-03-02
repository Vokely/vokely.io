"use client"

function parseTextToHTML(text) {
  if (!text || typeof text !== "string") return "";

  if (!text.includes("**") && !text.includes("[") && !text.includes("]")) {
    return text; 
  }

  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

const RenderJsonContent = ({ content }) => {
  console.log(content)
  if (!content || !Array.isArray(content)) {
    return <div>No content available</div>;
  }

  return (
    <div
      className="col-span-12 lg:col-span-8 font-in prose sm:prose-base md:prose-lg max-w-max
      prose-blockquote:bg-accent/20 
      prose-blockquote:p-2
      prose-blockquote:px-6
      prose-blockquote:border-accent
      prose-blockquote:not-italic
      prose-blockquote:rounded-r-lg
      prose-figure:relative
      prose-figcaption:mt-1
      prose-figcaption:mb-2
      prose-li:marker:text-accent
      dark:prose-invert
      dark:prose-blockquote:border-accentDark
      dark:prose-blockquote:bg-accentDark/20
      dark:prose-li:marker:text-accentDark
      first-letter:text-3xl
      sm:first-letter:text-5xl"
    >
      {content.map((item, index) => {
        switch (item.type) {
          case "paragraph":
            return (
              <p
                key={index}
                dangerouslySetInnerHTML={{
                  __html: parseTextToHTML(item.text),
                }}
              />
            );

          case "heading":
            const HeadingTag = `h${item.level}`;
            return (
              <HeadingTag
                key={index}
                dangerouslySetInnerHTML={{
                  __html: parseTextToHTML(item.text),
                }}
              />
            );

          case "list":
            const ListTag = item.style === "ordered" ? "ol" : "ul";
            return (
              <ListTag key={index}>
                {item.items.map((listItem, listIndex) => (
                  <li
                    key={listIndex}
                    dangerouslySetInnerHTML={{
                      __html: parseTextToHTML(String(listItem.text ?? "")),
                    }}
                  />
                ))}
              </ListTag>
            );
            case "link":
              return (
                <p key={index}>
                  <a
                    href={item.url}
                    target={item.openInNewTab ? "_blank" : "_self"}
                    rel={item.openInNewTab ? "noopener noreferrer" : undefined}
                    className="text-primary text-accent underline hover:text-accentDark transition-colors"
                  >
                    {item.text}
                  </a>
                </p>
              );            
          default:
            return null;
        }
      })}
    </div>
  );
};

export default RenderJsonContent;
