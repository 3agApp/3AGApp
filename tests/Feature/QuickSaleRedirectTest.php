<?php

it('redirects qs to the latest QuickSale app download', function () {
    $this->get('/qs')
        ->assertRedirect('https://github.com/3agApp/QuickSale/releases/latest/download/app-release.apk');
});
