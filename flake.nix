{
  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = inputs:
    inputs.flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = (import (inputs.nixpkgs) { inherit system; });
        linguo = pkgs.buildNpmPackage {
          pname = "linguo";
          version = "0.1.0";

          src = ./.;

          npmDepsHash = "sha256-EMrx/fDA4MIbqpHykwGVBzzfKF56adu+PCwIHDK0TWY=";

          nativeBuildInputs = [
            pkgs.makeWrapper
          ];

          postBuild = ''
            cp -r public .next/standalone/
            cp -r .next/static .next/standalone/.next/
          '';

          installPhase = ''
            cp -r .next/standalone $out
            mkdir -p $out/bin
            makeWrapper ${pkgs.nodejs}/bin/node $out/bin/linguo --add-flags "$out/server.js"
          '';
        };
      in {
        packages.default = linguo;

        apps.default = {
          type = "app";
          program = "${linguo}/bin/linguo";
        };
      }
    );
}
