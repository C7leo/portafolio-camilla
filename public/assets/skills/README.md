# Technology artwork

Local SVG copies keep the technology marquee independent of third-party CDNs at runtime.
Artwork is displayed with `object-fit: contain`; CSS applies a monochrome treatment.
All product names and trademarks belong to their respective owners.

## Existing original assets recovered from this repository

- Angular: https://angular.dev/press-kit (the documentation tutorial logomark).
- Java: https://www.oracle.com/a/ocom/img/obic-java-cup.svg
- Python: https://www.python.org/community/logos/
- Microsoft Azure: https://github.com/microsoft/sample-app-aoai-chatGPT/blob/main/frontend/src/assets/Azure.svg
- Microsoft Fabric and Power BI: https://learn.microsoft.com/en-us/fabric/fundamentals/icons
  (`fabric_48_color.svg` and `power_bi_48_color.svg`, official collection v6.1.0).

The two 48 px Microsoft SVGs and Python receive matching viewBoxes for responsive
sizing. Java's viewBox removes excess empty canvas to balance its apparent size.
The original vector geometry remains unchanged.

The .NET logo comes directly from the official brand repository:
https://github.com/dotnet/brand/blob/main/logo/dotnet-logo.svg

## Additional local SVGs

Source: https://github.com/devicons/devicon/tree/v2.17.0/icons
Version pinned to v2.17.0. Devicon's collection is licensed under MIT; the brand
artwork remains subject to its owners' trademark terms.

| File | Source within the collection |
| --- | --- |
| typescript.svg | typescript/typescript-plain.svg |
| sql.svg | microsoftsqlserver/microsoftsqlserver-plain.svg |
| docker.svg | docker/docker-plain.svg |
| github.svg | github/github-original.svg |
| vscode.svg | vscode/vscode-plain.svg |
| figma.svg | figma/figma-plain.svg |

The SQL illustration uses the SQL Server logomark seen in the supplied reference;
SQL itself is a language rather than an independently branded product.
