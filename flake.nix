{
  inputs = {
    utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };

  outputs = { self, nixpkgs, utils }:
    utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages."${system}";
      in {
       devShell = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            bun
            # deno
            typescript
            nodePackages.typescript-language-server
            tailwindcss-language-server
            just
            postgresql
            # playwright
            # playwright-test
            playwright-driver.browsers
          ];

          PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
          PLAYWRIGHT_BROWSER_EXECUTABLE_PATH = "${pkgs.playwright-driver.browsers}/chromium-1091/chrome-linux/chrome";
          PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = true;
        };
      });
}

