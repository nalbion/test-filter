var markSkippedAsPending = false;

jasmine.getEnv().specFilter = function(spec) {
    //console.info(spec.description);
    console.info(spec.result.fullName);
    //runnableLookupTable[spec.id]
    //console.info(spec);
    //console.info(spec.beforeAndAfterFns().befores)
    //spec.result.pendingReason = 'Nick hacked it';
    //return specFilter.matches(spec.getFullName());
    if (markSkippedAsPending) {
        spec.pend('Nick hacked it');
        return true;
    } else {
        return false;
    }
};
