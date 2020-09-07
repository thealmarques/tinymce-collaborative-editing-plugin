import { UnitTest, Assert } from '@ephox/bedrock-client';
import { addTwo } from '../../../main/ts/core/AddTwo';
// This is an example of an atomic test, that is a test of some functionality separated from the editor.
UnitTest.test('atomic.AddTwoTest', function () {
    Assert.eq('1 + 2 = 3, hopefully', 3, addTwo(1));
});
//# sourceMappingURL=AddTwoTest.js.map