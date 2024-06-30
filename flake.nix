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
            typescript
            nodePackages.typescript-language-server
            tailwindcss-language-server
            just
            postgresql
          ];
        };
      });
}

