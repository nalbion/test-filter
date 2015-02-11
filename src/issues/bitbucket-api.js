// GET https://bitbucket.org/api/1.0/repositories/{accountname}/{repo_slug}/issues
// { issues: [ {
//      local_id: 1,
//      status: 'new',      // new, open, on hold, resolved, duplicate, invalid, wontfix, closed
//      priority: 'major',  // trivial, minor, major, critical, blocker
//      title: 'my issue',
//      reported_by: { username: 'nalbion' },
//      responsible: { username: 'nalbion' },
//      metadata: {
//          kind: 'task',   // bug, enhancement, proposal, task
//          version: '1.0.0',
//          component: 'front-end',
//          milestone: '1.0.0'
//      },
