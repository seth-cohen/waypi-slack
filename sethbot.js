var matchMap = {
    deployBranch: 1,
    status: 2,
    rolledBack: 3,
    prodDeploy: 4
};

function parseMessageText(message) {
    if (typeof message !== 'string') {
        return false;
    }

    var regExp = /(deploy_.*) ((has been rolled back)|(has been deployed to production))/;
    var matches = message.match(regExp);

    var matchLines = [];
    if (matches) {
        matchLines.push(matches[matchMap.deployBranch]);
        matchLines.push(matches[matchMap.status]);
    }

    return matches ? matchLines : false;
}

module.exports = {};
module.exports.parseMessageText = parseMessageText;
