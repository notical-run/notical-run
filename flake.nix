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
            biome
            nodePackages.typescript
            nodePackages.typescript-language-server
            nodePackages.svelte-language-server
          ];
        };
      });
}

