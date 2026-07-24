const fs = require("fs");
const path = require("path");
const { withDangerousMod } = require("@expo/config-plugins");
const { mergeContents } = require("@expo/config-plugins/build/utils/generateCode");

const fmtMacroWorkaround = `
  # Globally disable consteval for fmt across all targets
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      current_defs = config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] || ['$(inherited)']
      current_defs = [current_defs] if current_defs.is_a?(String)
      current_defs << 'FMT_CONSTEVAL=' unless current_defs.include?('FMT_CONSTEVAL=')
      config.build_settings['GCC_PREPROCESSOR_DEFINITIONS'] = current_defs
    end
  end
`;

const withIosFmtFix = (config) => {
    return withDangerousMod(config, [
        "ios",
        async (config) => {
            const podfilePath = path.join(config.modRequest.platformProjectRoot, "Podfile");
            if (!fs.existsSync(podfilePath)) return config;

            const contents = fs.readFileSync(podfilePath, "utf-8");

            const updatedContents = mergeContents({
                tag: "withIosFmtFix",
                src: contents,
                newSrc: fmtMacroWorkaround,
                anchor: /post_install do \|installer\|/i,
                offset: 1,
                comment: "#",
            });

            if (updatedContents.didMerge) {
                fs.writeFileSync(podfilePath, updatedContents.contents);
            }
            return config;
        },
    ]);
};

module.exports = withIosFmtFix;
