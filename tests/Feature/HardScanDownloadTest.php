<?php

it('serves the hardscan service download from /scan', function () {
    $this->get('/scan')
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.android.package-archive');
});
