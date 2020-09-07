import { Pipeline, Logger, GeneralSteps } from '@ephox/agar';
import { TinyLoader, TinyApis, TinyUi } from '@ephox/mcagar';
import { UnitTest } from '@ephox/bedrock-client';
import Plugin from '../../../main/ts/Plugin';
// This an example of a browser test of the editor.
UnitTest.asynctest('browser.PluginTest', function (success, failure) {
    Plugin();
    TinyLoader.setup(function (editor, onSuccess, onFailure) {
        var tinyUi = TinyUi(editor);
        var tinyApis = TinyApis(editor);
        Pipeline.async({}, [
            Logger.t('test click on button', GeneralSteps.sequence([
                tinyUi.sClickOnToolbar('click budwriter button', 'button:contains("budwriter button")'),
                tinyApis.sAssertContent('<p>content added from budwriter</p>')
            ]))
        ], onSuccess, onFailure);
    }, {
        plugins: 'budwriter',
        toolbar: 'budwriter'
    }, success, failure);
});
//# sourceMappingURL=PluginTest.js.map