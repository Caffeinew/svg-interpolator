import React from "react";

const Home = () => {
  const formRef = React.useRef(undefined);
  const [firstFrame, setFirstFrame] = React.useState(undefined);
  const [lastFrame, setLastFrame] = React.useState(undefined);
  const [result, setResult] = React.useState(undefined);

  const handleChange = (event, set) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file?.type === "image/svg+xml") {
      reader.readAsText(file);
      reader.onload = () => set(reader.result);
      reader.onerror = () => console.log(reader.error);

      return;
    }

    formRef.current?.reset();
    set(undefined);
    alert("dont be sneaky 😾");
  };

  const filterPaths = (svg: ChildNode) => {
    const array = Array.prototype.slice
      .call(svg.childNodes)
      .filter((node) => node.tagName === "path");

    return array;
  };
  const getValuesFromPath = (path) => {
    const attributes: Node[] = Object.values(path.attributes);
    const id: string = attributes.find(
      (attr: Node) => attr.nodeName === "id"
    ).nodeValue;
    const d: string = attributes.find(
      (attr: Node) => attr.nodeName === "d"
    ).nodeValue;

    return { id, d };
  };
  const animatePaths = (from, to) => {
    const result = from.map((fromPath) => {
      const fromValues = getValuesFromPath(fromPath);

      const matchingPath = to.find((toPath) => {
        const values = getValuesFromPath(toPath);
        return fromValues.id === values.id;
      });

      const toValues = getValuesFromPath(matchingPath);
      const animateElement = document.createElement("animate");
      animateElement.setAttributeNS(null, "repeatCount", "indefinite");
      animateElement.setAttribute("dur", "1s");
      animateElement.setAttributeNS(null, "attributeName", "d");
      animateElement.setAttribute(
        "values",
        `${fromValues.d}; ${toValues.d}; ${fromValues.d}`
      );

      fromPath.appendChild(animateElement);

      return fromPath;
    });

    return result;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const parser = new DOMParser();
    const temp = parser.parseFromString(firstFrame, "image/svg+xml").firstChild;
    const from = filterPaths(temp);
    const to = filterPaths(
      parser.parseFromString(lastFrame, "image/svg+xml").firstChild
    );

    const result = animatePaths(from, to);
    while (temp.firstChild) {
      temp.removeChild(temp.firstChild);
    }
    result.forEach((node) => temp.appendChild(node));

    const serializer = new XMLSerializer();

    setResult(
      "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(serializer.serializeToString(temp).replaceAll('xmlns="http://www.w3.org/1999/xhtml"', ""))
    );
    console.log(temp);
  };
  return (
    <div className="w-full h-screen flex justify-center items-center bg-gray-50">
      <form
        className="flex flex-col border bg-white p-16 gap-4"
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <div className="relative flex py-4 w-64 justify-center border bg-white">
          <input
            className="absolute inset-0 opacity-0 cursor-pointer"
            type="file"
            required={true}
            onChange={(event) => handleChange(event, setFirstFrame)}
          />
          <span>{firstFrame ? "Success 👍" : "Upload Start Frame"}</span>
        </div>
        <div className="relative flex py-4 w-64 justify-center border bg-white">
          <input
            className="absolute inset-0 opacity-0 cursor-pointer"
            type="file"
            required={true}
            onChange={(event) => handleChange(event, setLastFrame)}
          />
          <span>{lastFrame ? "Success 👍" : "Upload End Frame"}</span>
        </div>
        <button type="submit" className="bg-blue-400 text-white px-8 py-4">
          Animate 🤖
        </button>
        {result && (
          <a
            href={result}
            children="Download 😺"
            className="flex justify-center bg-blue-400 text-white px-8 py-4"
          />
        )}
      </form>
    </div>
  );
};

export default Home;
